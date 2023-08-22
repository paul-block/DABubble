import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService {
  db = getFirestore();
  currentChatSection = 'noChatSectionSelected';
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];
  currentChatData;
  messageToPlaceholder: string = 'Nachricht an ...';


  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
  ) { }

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
              this.currentChatData = chatData;
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


  textAreaMessageTo() {
    if (this.currentChatSection === 'chats') {
      this.getReceiverName();
      this.messageToPlaceholder = 'Nachricht an ' + this.authService.userData.user_name;
    } else if (this.currentChatSection === 'channels') {
      this.messageToPlaceholder = 'Nachricht an ' + this.currentChatData.channelName;
    }

  }


  getReceiverName() {
    if (this.currentChatData.chat_Member_IDs[0] === this.authService.getUid()) {
      this.authService.getUserData(this.currentChatData.chat_Member_IDs[1]);
    } else {
      this.authService.getUserData(this.currentChatData.chat_Member_IDs[0]);
    }
  }

  getCurrentChatData() {
    this.currentChatData = this.channelService.channels.find(channel => channel.channel_ID === this.currentChatID);
    console.log(this.currentChatData);
  }
}
