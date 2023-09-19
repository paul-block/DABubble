import { Injectable, OnInit, Query } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs, getDoc, query, orderBy, onSnapshot, setDoc } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';
import { GeneralFunctionsService } from './general-functions.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  db = getFirestore();
  open_chat: boolean = false
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
  userReceiverName: string;
  thread_open: boolean = false
  openNewMsgComponent: boolean = false;
  directedFromProfileButton: boolean = false;
  sidebarVisible: boolean = true;
  timeoutSidebarHide: boolean = false;
  toggleSidebarMenuText: string = 'Workspace-Menü schließen';



  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService,
  ) { }


  async loadChats(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chats = [];
      const querySnapshot = collection(this.db, 'chats');
      onSnapshot(querySnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const chatData = change.doc.data();
          const isDataAlreadyInChats = this.chats.some(chat => JSON.stringify(chat) === JSON.stringify(chatData))
          if (change.type === 'added' && this.isUserChat(chatData) && !isDataAlreadyInChats) this.chats.push(chatData);
        });
        resolve();
      });
    });
  }


  isUserChat(chatData) {
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
    }
    if (!chatExists) await this.newChat(userID);
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


  async newChat(userReceiverID: string): Promise<string | null> {
    const userID = this.currentUser_id;
    this.directChatMessages = [];
    return new Promise(async (resolve, reject) => {
      try {
        const time_stamp = new Date();

        if (!userID) {
          reject("Kein Benutzer ist eingeloggt");
          return;
        }
        const customChatID = await this.genFunctService.generateCustomFirestoreID();
        await setDoc(doc(collection(this.db, 'chats'), customChatID), {
          chat_Member_IDs: [userID, userReceiverID],
          created_At: time_stamp,
          chat_ID: customChatID
        });

        resolve(customChatID);
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Chats: ", error);
        reject(error);
      }
    });
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

  // getChatReceiverUser(chat) {
  //   let chatReveiverID;
  //   try {
  //     if (!chat) {
  //       return null;
  //     }

  //     if (chat.chat_Member_IDs[0] !== this.currentUser_id) {
  //       chatReveiverID = chat.chat_Member_IDs[0];
  //     } else {
  //       chatReveiverID = chat.chat_Member_IDs[1];
  //     }
  //   } catch (error) {
  //     console.error(error);

  //   }

  //   const user = this.authService.all_users.find(user => user.uid === chatReveiverID);
  //   return user;
  // }

  getChatReceiverUser(chat) {
    let chatReveiverID;
    try {
      if (!chat || chat.channelName) {
        return null;
      }

      if (chat.chat_Member_IDs[0] !== this.currentUser_id) {
        chatReveiverID = chat.chat_Member_IDs[0];
      } else {
        chatReveiverID = chat.chat_Member_IDs[1];
      }
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten beim Verarbeiten des Chats:", chat);
      console.error("Stacktrace:", error.stack);
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
          const formattedName = this.authService.all_users[j].uid
          if (lastName && lastName == word2) {
            words[i] = formattedName
            words.splice(i + 1, 1)
          }
          if (firstName == word_without_at && !lastName) words[i] = formattedName
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
    text += ' ' + '@' + this.at_users[i].user_name;
    return text;
  }


  checkIfWordIsAnId(word: string) {
    if (word.includes('\n')) word = word.replace(/\n/, '');
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return true
    else return false
  }


  renameUid(word: string) {
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return '@' + user.user_name
    else return word
  }


  checkForBreak(word: string) {
    if (word.includes('\n')) return true
    else return false
  }

  toggleSidebar() {
    if (window.innerWidth < 1300 && this.thread_open == true) this.thread_open = false
    if (this.sidebarVisible) {
      this.sidebarVisible = false;
      this.changeText('Workspace-Menü öffnen');
    } else {
      this.sidebarVisible = true
      this.changeText('Workspace-Menü schließen');
    }
  }

  changeText(text) {
    this.toggleSidebarMenuText = text;
  }
}
