import { Injectable, OnInit } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, onSnapshot, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService {
  db = getFirestore();
  currentChatID: string = 'noChatSelected'

  constructor() { }

  async searchChat(user_name) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      try {
        const querySnapshot = await getDocs(collection(this.db, 'users'));
        let userReceiverID = null;

        querySnapshot.forEach((doc) => {
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
        created_At: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const newMessageID = messagesCollectionRef.id;
      await updateDoc(messagesCollectionRef, {
        message_ID: newMessageID
      });
    }
  }

}
