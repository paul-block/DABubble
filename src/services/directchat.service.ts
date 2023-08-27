import { Injectable, OnInit, Query } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, getDocs, CollectionReference } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService  {

  db = getFirestore();
  at_users:any
  currentChatSection = 'noChatSectionSelected';
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];
  currentChatData;
  messageToPlaceholder: string = 'Nachricht an ...';
  chats: any[] = [];
  private chatsSubject = new BehaviorSubject<any[]>([]);
  currentUser_id: string
  open_users: boolean = false;



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


  filterChats(chats) {
    return chats.filter(chat => chat.chat_Member_IDs.includes(this.authService.getUid()));
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
      console.log('in');
    }
  }


  // async searchChat(userReceiverID) {
  //   const auth = getAuth();
  //   const user = auth.currentUser;

  //   if ('currentUser' === userReceiverID) {
  //     userReceiverID = user.uid;
  //   }

  //   if (user !== null) {
  //     try {
  //       this.currentChatID = null;
  //       if (userReceiverID !== null) {
  //         const docChatsSnapshot = await getDocs(collection(this.db, 'chats'));
  //         let chatExists = false;
  //         docChatsSnapshot.forEach((chat) => {
  //           const chatData = chat.data();
  //           const sortedMemberIDs = chatData.chat_Member_IDs.slice().sort();
  //           if ((sortedMemberIDs[0] === userReceiverID && sortedMemberIDs[1] === user.uid) || (sortedMemberIDs[1] === userReceiverID && sortedMemberIDs[0] === user.uid)) {
  //             chatExists = true;
  //             this.currentChatID = chatData.chat_ID;
  //             this.currentChatData = chatData;
  //           }
  //         });

  //         if (!chatExists) {
  //           await this.newChat(userReceiverID);
  //         }
  //       } else {
  //         console.error("Benutzer nicht gefunden");
  //       }
  //     } catch (error) {
  //       console.error("Fehler bei der Suche nach einem Chat: ", error);
  //     }
  //   } else {
  //     console.error("Kein Benutzer ist eingeloggt");
  //   }
  // }


  async newChat(userReceiverID: string) {
    const userID = this.currentUser_id;
    this.directChatMessages = [];

    if (userID !== undefined) {
      try {
        const chatsCollectionRef = await addDoc(collection(this.db, 'chats'), {
          chat_Member_IDs: [userID, userReceiverID],
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });

        const newChatID = chatsCollectionRef.id;
        const chatDocRef = doc(this.db, 'chats', newChatID);
        await updateDoc(chatDocRef, {
          chat_ID: newChatID
        }).then(() => {
          this.loadChats();
        });
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
    const search_word = this.at_users[i].word
    const words = text.split(' ');
    let index = words.indexOf(search_word)
    words[index] = ''
    text = words.join(' ')
    text += '@' + this.at_users[i].user_name
    return text
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
