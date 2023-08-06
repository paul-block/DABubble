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
export class ChannelDirectchatService {
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
              this.openChat(user_name);
            }
          });

          if (!chatExists) {
            await this.newChat(userReceiverID);
          }
        } else {
          console.error("Benutzer nicht gefunden");
          this.currentChatID = 'noChatSelected';
        }
      } catch (error) {
        console.error("Fehler bei der Suche nach einem Chat: ", error);
        this.currentChatID = 'noChatSelected';
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
      this.currentChatID = 'noChatSelected';
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
        this.currentChatID = 'noChatSelected';
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
      this.currentChatID = 'noChatSelected';
    }
  }

  async openChat(user_name) {
    console.log('openchat: ' + user_name);

  }

  async newMessage(message: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (this.currentChatID === 'noChatSelected') {
      console.log(this.currentChatID);
    } else {

    }
  }

}
