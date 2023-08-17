import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService {
  db = getFirestore();
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];


  async searchChat(userReceiverID) {
    const auth = getAuth();
    const user = auth.currentUser;

    if ('currentUser' === userReceiverID) {
      userReceiverID = user.uid;
    }

    if (user !== null) {
      try {
        this.currentChatID = null;
        if (userReceiverID !== null) {
          const docChatsSnapshot = await getDocs(collection(this.db, 'chats'));
          let chatExists = false;
          docChatsSnapshot.forEach((chat) => {
            const chatData = chat.data();
            const sortedMemberIDs = chatData.chat_Member_IDs.slice().sort();
            if ((sortedMemberIDs[0] === userReceiverID && sortedMemberIDs[1] === user.uid) || (sortedMemberIDs[1] === userReceiverID && sortedMemberIDs[0] === user.uid)) {
              chatExists = true;
              this.currentChatID = chatData.chat_ID;
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


  async newChat(userReceiverID: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    this.directChatMessages = [];

    if (user !== null) {
      try {
        const chatsCollectionRef = await addDoc(collection(this.db, 'chats'), {
          chat_Member_IDs: [user.uid, userReceiverID],
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const newChatID = chatsCollectionRef.id;
        const chatDocRef = doc(this.db, 'chats', newChatID);
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
  

}
