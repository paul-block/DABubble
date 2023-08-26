import { Injectable, Query } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs, CollectionReference } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
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
  chats: any[] = [];
  private chatsSubject = new BehaviorSubject<any[]>([]);

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
  ) { }

  async loadChats() {
    const querySnapshot = await getDocs(collection(this.db, 'chats'));
    const chats = querySnapshot.docs.map(doc => doc.data());
    this.chatsSubject.next(chats);
  }

  getUsersChatsObservable() {
    return this.chatsSubject.asObservable().pipe(
      switchMap(chats => {
        const usersChats = this.filterChats(chats);
        return usersChats;
      })
    );
  }


  filterChats(chats){
    return chats.filter(chat => chat.chat_Member_IDs.includes(this.authService.getUid()));
  }


   // async initOwnChat() {
    
  //   const userID = this.authService.getUid();
  //   let chatExists = false;

  //   if (this.chats.length != 0) {
  //     this.chats.forEach((chat) => {
  //       if (chat.chat_Member_IDs[0] === userID && chat.chat_Member_IDs[1] === userID) {
  //         chatExists = true;
  //       }
  //     });
  //   } else if (!chatExists) {
  //     await this.newChat(await userID);
  //   }
  // }


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
      this.messageToPlaceholder = 'Nachricht an ' + this.getChatReceiverUser(this.currentChatData).user_name;
    } else if (this.currentChatSection === 'channels') {
      this.messageToPlaceholder = 'Nachricht an ' + this.currentChatData.channelName;
    }
  }

  getChatReceiverUser(chat) {
    let chatReveiverID;
    if (chat.chat_Member_IDs[0] !== this.authService.getUid()) {
      chatReveiverID = chat.chat_Member_IDs[0];
    } else {
      chatReveiverID = chat.chat_Member_IDs[1];
    }
    const user = this.authService.all_users.find(user => user.uid === chatReveiverID);
    return user;
  }

  getCurrentChatData() {
    if (this.currentChatSection === 'channels') {
      this.currentChatData = this.channelService.channels.find(channel => channel.channel_ID === this.currentChatID);
    } else if (this.currentChatSection === 'chats') {
      this.currentChatData = this.chats.find(chat => chat.chat_ID === this.currentChatID);
    }

    console.log(this.currentChatData);
  }
}
