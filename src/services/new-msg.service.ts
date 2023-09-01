import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { getAuth } from '@firebase/auth';
import { addDoc, collection, doc, getDocs, getDoc, query, where, updateDoc } from '@firebase/firestore';
import { AuthenticationService } from './authentication.service';
import firebase from 'firebase/compat/app';


@Injectable({
  providedIn: 'root'
})

export class NewMsgService {

  openNewMsg: boolean = false;
  db = this.authService.db;
  user_name: string;
  user_id: string;
  directedFromProfileButton: boolean = false;
  newMsgComponentOpen: boolean = false;
  selectedChannelID: string;




  constructor(private authService: AuthenticationService) { }

  async addOrUpdateChat(messageText: string, channelOrUserInput: string) {
    const auth = getAuth();
    const currentUserUID = auth.currentUser.uid;

    const userRef = doc(this.db, 'users', currentUserUID);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists) {
      console.error('Der aktuelle Benutzer wurde nicht in der Datenbank gefunden.');
      return;
    }

    const userName = userDoc.data().user_name;

    if (channelOrUserInput.startsWith('#') || channelOrUserInput.includes('#')) {
      const channelName = channelOrUserInput.substring(1);
      console.log(channelName);
      const channelsCollection = collection(this.db, 'channels');
      const channelQuery = query(channelsCollection, where('channelName', '==', channelName));
      const channelSnapshot = await getDocs(channelQuery);

      let channelDocRef;
      channelSnapshot.forEach(doc => {
        const channelData = doc.data();
        if (channelData.assignedUsers.includes(currentUserUID)) {
          channelDocRef = doc.ref;
        }
      });
      if (channelDocRef) {
        const channelMessagesCollectionRef = collection(channelDocRef, 'messages');
        const newMessageDocRef = await addDoc(channelMessagesCollectionRef, {
          answers: 0,
          chat_message: messageText,
          chat_message_edited: false,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
          emoji_data: [],
          last_answer: '',
          user_Sender_ID: currentUserUID,
          user_Sender_Name: userName,
        });
        const newMessageId = newMessageDocRef.id;
        await updateDoc(newMessageDocRef, { message_ID: newMessageId });

        console.log('Nachricht zum Channel hinzugefügt mit ID:', newMessageId);
      } else {
        console.error('Benutzer nicht für den Channel autorisiert oder Channel nicht gefunden');
      }

    } else if (channelOrUserInput.startsWith('@') || channelOrUserInput.includes('@')) {

      const receiverUID = this.user_id;
      const chatCollection = collection(this.db, 'chats');

      let chatDocExists = false;
      let chatDocRef;

      if (currentUserUID === receiverUID) {
        const sortedUIDs = [currentUserUID, receiverUID].sort();
        const selfChatQuery = query(chatCollection, where('chat_Member_IDs', '==', sortedUIDs));
        const selfChatSnapshot = await getDocs(selfChatQuery);

        selfChatSnapshot.forEach(doc => {
          const chatData = doc.data();
          if (chatData.chat_Member_IDs.includes(receiverUID) && chatData.chat_Member_IDs.includes(currentUserUID)) {
            chatDocExists = true;
            chatDocRef = doc;
          }
        });
      } else {
        const otherChatQuery = query(chatCollection, where('chat_Member_IDs', 'array-contains', currentUserUID));
        const otherChatSnapshot = await getDocs(otherChatQuery);

        otherChatSnapshot.forEach(doc => {
          const chatData = doc.data();
          if (chatData.chat_Member_IDs.includes(receiverUID)) {
            chatDocExists = true;
            chatDocRef = doc;
          }
        });
      }

      if (chatDocExists && chatDocRef) {
        const messagesCollectionRef = collection(chatDocRef.ref, 'messages');
        await addDoc(messagesCollectionRef, {
          chat_message: messageText,
          user_Sender_ID: currentUserUID,
          user_name: userName,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log('chat dokument gefunden, fügt neues dokument in die vorhandenen messages');
      } else {
        const newChatRef = await addDoc(chatCollection, {
          chat_Member_IDs: [currentUserUID, receiverUID].sort(),
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log('kein chat gefunden, erstelle neuen');

        const newMessagesCollectionRef = collection(newChatRef, 'messages');
        await addDoc(newMessagesCollectionRef, {
          chat_message: messageText,
          user_Sender_ID: currentUserUID,
          user_name: userName,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log('neue nachricht in neuen chat hinzugefügt');
      }

    } else {
      console.error('Ungültiger Eingabewert. Es sollte mit # oder @ beginnen.');
    }
  }
}

