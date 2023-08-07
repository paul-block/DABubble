import { Injectable, OnInit } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, arrayUnion, updateDoc, collection, addDoc, orderBy, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService {
  db = getFirestore();
  currentChatID: string = 'noChatSelected'
  directChatMessages = [];

  constructor() { }

  async searchChat(user_name) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      try {
        const docDirectChatsSnapshot = await getDocs(collection(this.db, 'users'));
        let userReceiverID = null;

        docDirectChatsSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.user_name === user_name) {
            userReceiverID = userData.uid;
          }
        });

        if (userReceiverID !== null) {
          const chatsQuerySnapshot = await getDocs(collection(this.db, 'users', user.uid, 'chats'));
          let chatExists = false;
          chatsQuerySnapshot.forEach((doc) => {
            const chatData = doc.data();
            if (chatData.user_Receiver_ID === userReceiverID) {
              chatExists = true;
              this.currentChatID = chatData.chat_ID;
              this.openChat(user_name);

            }
          });

          if (!chatExists) {
            await this.newChat(userReceiverID);
          }
        } else {
          console.error("Benutzer nicht gefunden");
        }
      } catch (error) {
        console.error("Fehler bei der Suche nach einem Chat: ", error);
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }


  async newChat(userReceiverName: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    userReceiverName = user.uid;

    if (user !== null) {
      try {
        const chatsCollectionRef = await addDoc(collection(this.db, 'users', user.uid, 'chats'), {
          user_Receiver_ID: userReceiverName,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const newChatID = chatsCollectionRef.id;
        const chatDocRef = doc(this.db, 'users', user.uid, 'chats', newChatID);
        await updateDoc(chatDocRef, {
          chat_ID: newChatID
        });
        this.currentChatID = newChatID;
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Chats: ", error);
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }

  async openChat(user_name) {
    console.log('openchat: ' + user_name);
    console.log('opened chat: ' + this.currentChatID);
    this.getMessages();
  }

  async newMessage(message: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (this.currentChatID === 'noChatSelected') {
      console.log(this.currentChatID);
    } else {
      console.log(message);

      const messagesCollectionRef = await addDoc(collection(this.db, 'users', user.uid, 'chats', this.currentChatID, 'messages'), {
        chat_message: message,
        user_Sender_ID: user.uid,
        user_Sender_Name: await this.getNameFromUid(user.uid),
        created_At: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const newMessageID = messagesCollectionRef.id;
      await updateDoc(messagesCollectionRef, {
        message_ID: newMessageID,
      });
      this.getMessages();
    }
  }

  async getMessages() {
    const auth = getAuth();
    const user = auth.currentUser;

    this.directChatMessages = [];
    const chatMessagesRef = collection(this.db, 'users', user.uid, 'chats', this.currentChatID, 'messages');
    const docDirectChatMessagesSnapshot = await getDocs(query(chatMessagesRef, orderBy("created_At", "asc")));

    docDirectChatMessagesSnapshot.forEach((doc) => {
      const userData = doc.data();
      this.directChatMessages.unshift(userData);
    });
  }


  getTimestampTime(timestamp) {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }

  async getNameFromUid(uid: string) {
    try {
      const userDocRef = doc(this.db, 'users', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists) {
        const userData = userDocSnapshot.data();
        return userData.user_name;
      } else {
        console.log('Benutzer nicht gefunden');
        return 'deleted User';
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzernamens:', error);
      return 'user not existing';
    }
  }


}
