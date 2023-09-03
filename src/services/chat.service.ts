import { Injectable, OnInit, Query } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs, getDoc, query, orderBy, onSnapshot } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  db = getFirestore();
  at_users: any
  currentChatSection = 'noChatSectionSelected';
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];
  currentChatData;
  messageToPlaceholder: string = 'Nachricht an ...';
  chats: any[] = [];
  currentUser_id: string
  open_users: boolean = false;
  userReceiverID: string;

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
  ) { }


  async loadChats(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chats = [];

      const querySnapshot = collection(this.db, 'chats');
      onSnapshot(querySnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const chatData = change.doc.data();
          if (change.type === 'added' && this.isUserChat(chatData)) {
            this.chats.push(chatData);
          }
        });
        console.log(this.chats);
        
        resolve();
      });
    });
  }

  isUserChat(chatData){
    return chatData.chat_Member_IDs.includes(this.currentUser_id)
  }

  async initOwnChat() {
    const userID = this.currentUser_id;
    let chatExists = false;
    if (this.chats.length != 0) {
      this.chats.forEach((chat) => {
        if (chat.chat_Member_IDs[0] === userID && chat.chat_Member_IDs[1] === userID) {

          chatExists = true;
        }
      });
    } else if (!chatExists) {

      await this.newChat(userID);
      console.log('ownChatGenerated');
    }
  }

  async searchChat(userReceiverID): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    let foundChatId = null;

    if (user !== null) {
      try {
        const docChatsSnapshot = await getDocs(collection(this.db, 'chats'));

        docChatsSnapshot.forEach((chat) => {
          const chatData = chat.data();
          const sortedMemberIDs = chatData.chat_Member_IDs.slice().sort();

          if (
            (sortedMemberIDs[0] === userReceiverID && sortedMemberIDs[1] === user.uid) ||
            (sortedMemberIDs[1] === userReceiverID && sortedMemberIDs[0] === user.uid)
          ) {
            foundChatId = chatData.chat_ID;
          }
        });

        return foundChatId;

      } catch (error) {
        console.error("Fehler bei der Suche nach einem Chat: ", error);
        return null;
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
      return null;
    }
  }

  async getChatDocument() {
    if (this.currentChatID) {
      const docRef = doc(this.db, 'chats', this.currentChatID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } else {
      console.log("currentChatID is not set!");
      return null;
    }
  }


  async newChat(userReceiverID: string) {
    debugger
    const userID = this.currentUser_id;
    this.directChatMessages = [];
    let time_stamp = new Date();
    if (userID !== undefined) {
      try {
        const chatsCollectionRef = await addDoc(collection(this.db, 'chats'), {
          chat_Member_IDs: [userID, userReceiverID],
          created_At: time_stamp,
        });

        const newChatID = chatsCollectionRef.id;
        const chatDocRef = doc(this.db, 'chats', newChatID);
        await updateDoc(chatDocRef, {
          chat_ID: newChatID
        })
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
    } else {
      this.messageToPlaceholder = 'Nachricht an ...';
    }
  }

  getChatReceiverUser(chat) {
    let chatReveiverID;
    if (chat.chat_Member_IDs[0] !== this.currentUser_id) {
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
  }


  //-----------------------------------------------------------------@user Funktionen


  modifyMessageValue(message: string) {
    const words = message.split(' ')
    for (let i = 0; i < words.length; i++) {
      let word1 = words[i];
      let word2 = words[i + 1]
      if (word1.startsWith('@')) {
        let word_without_at = word1.substring(1);
        for (let j = 0; j < this.authService.all_users.length; j++) {
          const [firstName, lastName] = this.authService.all_users[j].user_name.split(' ');
          if (lastName && lastName == word2) {
            const formattedName = this.authService.all_users[j].uid
            words[i] = formattedName
            words.splice(i + 1, 1)
          }
          if (firstName == word_without_at && !lastName) {
            const formattedName = this.authService.all_users[j].uid
            words[i] = formattedName
          }
        }
      }
    }
    return words
  }


  textChanged(text: string) {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.startsWith('@')) {
        if (i === words.length - 1) {
          this.searchUserByLetter(word);
        }
      }
      if (word.length == 0) this.open_users = false;
    }
    return words.join(' ')
  }


  async searchUserByLetter(word: string) {
    this.open_users = true;
    const word_without_at = word.substring(1);
    const filterValue = word_without_at.toLowerCase();
    const filteredUsers = this.authService.all_users.filter(element =>
      element.user_name.toLowerCase().startsWith(filterValue)
    );
    const filteredAndProcessedUsers = filteredUsers.map(user => {
      return {
        ...user,
        word: word
      };
    });
    this.at_users = filteredAndProcessedUsers;
  }


  addUserToTextarea(i: number, text: string) {
    const search_word = this.at_users[i].word;
    const words = text.split(' ');
    let index = words.indexOf(search_word);
    words[index] = '';
    text = words.join(' ');
    text += '@' + this.at_users[i].user_name;
    return text;
  }


  checkIfWordIsAnId(word: string) {
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return true
    else return false
  }


  renameUid(word: string) {
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return '@' + user.user_name
    else return word
  }
}
