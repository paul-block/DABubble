import { Injectable } from '@angular/core';
import { doc, getFirestore, collection, getDocs, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';
import { GeneralFunctionsService } from './general-functions.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  db = getFirestore();
  open_chat: boolean = false;
  at_users: any;
  currentChatSection = 'noChatSectionSelected';
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];
  currentChatData;
  messageToPlaceholder: string = 'Nachricht an ...';
  chats: any[] = [];
  currentUser_id: string;
  open_users: boolean = false;
  userReceiverID: string;
  userReceiverName: string;
  thread_open: boolean = false;
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


  /**
   * Loads the chat documents from the 'chats' collection in Firestore. 
   * Filters out chats that the current user is not a part of.
   * 
   * @returns {Promise<void>} Resolves once the chats are loaded and filtered.
   */
  async loadChats(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chats = [];
      const querySnapshot = collection(this.db, 'chats');
      onSnapshot(querySnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const chatData = change.doc.data();
          const isDataAlreadyInChats = this.chats.some(chat => JSON.stringify(chat) === JSON.stringify(chatData));
          if (change.type === 'added' && this.isUserChat(chatData) && !isDataAlreadyInChats) this.chats.push(chatData);
        });
        resolve();
      });
    });
  }

  /**
   * Checks if the provided chat data contains the current user's ID.
   * Used to determine if the chat is relevant to the current user.
   * 
   * @param {any} chatData - The chat data to inspect.
   * @returns {boolean} `true` if the current user is part of the chat, `false` otherwise.
   */
  isUserChat(chatData) {
    return chatData.chat_Member_IDs.includes(this.currentUser_id);
  }

  /**
   * Initializes the user's own chat in Firestore if it doesn't already exist.
   */
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

  /**
   * Searches for a chat document based on the provided userReceiverID. 
   * 
   * @param {string} userReceiverID - The ID of the receiving user to search for.
   * @returns {Promise<string|null>} The chat ID if found, `null` otherwise.
   */
  async searchChat(userReceiverID): Promise<string | null> {
    let foundChatId = null;
    if (this.authService.getUid() !== null) {
      try {
        const docChatsSnapshot = await getDocs(collection(this.db, 'chats'));
        docChatsSnapshot.forEach((chat) => {
          const chatData = chat.data();
          if (this.exactChatMemberIDs(chatData, userReceiverID)) {
            foundChatId = chatData.chat_ID;
          }
        });
        return foundChatId;
      } catch (error) {
        console.error("Fehler bei der Suche nach einem Chat: ", error);
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
    return null;
  }

  /**
   * Checks if the provided chat data has the exact member IDs as specified.
   * Used to determine if a chat already exists between two specific users.
   * 
   * @param {any} chatData - The chat data to inspect.
   * @param {string} userReceiverID - The ID of the receiving user to match against.
   * @returns {boolean} `true` if the chat data matches the exact user IDs, `false` otherwise.
   */
  exactChatMemberIDs(chatData, userReceiverID) {
    const sortedMemberIDs = chatData.chat_Member_IDs.slice().sort();
    return (sortedMemberIDs[0] === userReceiverID && sortedMemberIDs[1] === this.authService.getUid()) ||
      (sortedMemberIDs[1] === userReceiverID && sortedMemberIDs[0] === this.authService.getUid());
  }

  /**
   * Retrieves the chat document based on the current chat ID.
   * 
   * @returns {Promise<any|null>} The chat document data if found, `null` otherwise.
   */
  async getChatDocument() {
    if (this.currentChatID) {
      const docRef = doc(this.db, 'chats', this.currentChatID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Creates a new chat document in Firestore with the specified receiver ID.
   * @param {string} userReceiverID - The ID of the user receiving the chat.
   * @returns {Promise<string|null>} The custom chat ID of the new chat if successful, `null` otherwise.
   */
  async newChat(userReceiverID: string): Promise<string | null> {
    const userID = this.currentUser_id;
    this.directChatMessages = [];
    return new Promise(async (resolve, reject) => {
      try {
        const time_stamp = new Date();
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

  /**
   * Sets the placeholder text for the message textarea based on the current chat section.
   */
  textAreaMessageTo() {
    if (this.currentChatSection === 'chats') {
      this.messageToPlaceholder = 'Nachricht an ' + this.getChatReceiverUser(this.currentChatData).user_name;
    } else if (this.currentChatSection === 'channels') {
      this.messageToPlaceholder = 'Nachricht an ' + this.currentChatData.channelName;
    } else {
      this.messageToPlaceholder = 'Nachricht an ...';
    }
  }

  /**
   * Retrieves the receiver user data from the provided chat.
   * @param {any} chat - The chat data containing member IDs.
   * @returns {any} The receiver user data if found, `null` otherwise.
   */
  getChatReceiverUser(chat) {
    let chatReveiverID;
    try {
      if (!chat || chat.channelName) return null;
      if (chat.chat_Member_IDs[0] !== this.currentUser_id) chatReveiverID = chat.chat_Member_IDs[0];
      else chatReveiverID = chat.chat_Member_IDs[1];
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten beim Verarbeiten des Chats:", chat);
    }
    const user = this.authService.all_users.find(user => user.uid === chatReveiverID);
    return user;
  }


  /**
   * Gets the data of the current chat based on the chat section and chat ID.
   */
  getCurrentChatData() {
    if (this.currentChatSection === 'channels') {
      this.currentChatData = this.channelService.channels.find(channel => channel.channel_ID === this.currentChatID);
    } else if (this.currentChatSection === 'chats') {
      this.currentChatData = this.chats.find(chat => chat.chat_ID === this.currentChatID);
    }
  }

  /**
   * Modifies a given message text to replace user mentions (starting with '@') 
   * with the respective user's ID from the user list.
   * @param {string} message - The original message text containing user mentions.
   * @returns {string} The modified message with user mentions replaced by their respective IDs.
   */
  modifyMessageValue(message: string) {
    const words = message.split(' ');
    for (let i = 0; i < words.length; i++) {
      let word1 = words[i];
      let word2 = words[i + 1];
      if (word1.startsWith('@')) {
        let word_without_at = word1.substring(1);
        for (let j = 0; j < this.authService.all_users.length; j++) {
          const [firstName, lastName] = this.authService.all_users[j].user_name.split(' ');
          const formattedName = this.authService.all_users[j].uid;
          if (lastName && lastName == word2) {
            words[i] = formattedName;
            words.splice(i + 1, 1);
          }
          if (firstName == word_without_at && !lastName) words[i] = formattedName;
        }
      }
    }
    return words;
  }

  /**
   * Triggers user search functionality when typing a word starting with '@' in a message.
   * @param {string} text - The message text being typed.
   * @returns {string} The message text with possible user mentions processed.
   */
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
    return words.join(' ');
  }

  /**
   * Searches for users whose names start with the provided word (without '@' prefix).
   * @param {string} word - The word being used to search for users.
   */
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

  /**
   * Inserts the selected user's name at the position of the '@' mention in the message text.
   * @param {number} i - The index of the selected user from the user mention suggestions.
   * @param {string} text - The current message text.
   * @returns {string} The updated message text with the selected user's name inserted.
   */
  addUserToTextarea(i: number, text: string) {
    const search_word = this.at_users[i].word;
    const words = text.split(' ');
    let index = words.indexOf(search_word);
    words[index] = '';
    text = words.join(' ');
    text += ' ' + '@' + this.at_users[i].user_name;
    return text;
  }

  /**
   * Checks if a given word matches a user ID in the list of all users.
   * @param {string} word - The word (or ID) to check.
   * @returns {boolean} `true` if the word matches a user ID, `false` otherwise.
   */
  checkIfWordIsAnId(word: string) {
    if (word.includes('\n')) word = word.replace(/\n/, '');
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return true;
    else return false;
  }

  /**
   * Replaces a given user ID with the corresponding user's mention (e.g., '@username').
   * @param {string} word - The user ID to replace.
   * @returns {string} The user's mention if the ID is found, the original word otherwise.
   */
  renameUid(word: string) {
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return '@' + user.user_name;
    else return word;
  }

  /**
   * Checks if a word contains a newline character.
   * @param {string} word - The word to check.
   * @returns {boolean} `true` if the word contains a newline character, `false` otherwise.
   */
  checkForBreak(word: string) {
    if (word.includes('\n')) return true;
    else return false;
  }

  /**
   * Toggles the visibility state of the sidebar UI component.
   */
  toggleSidebar() {
    if (this.sidebarVisible) {
      this.sidebarVisible = false;
      this.changeText('Workspace-Menü öffnen');
    } else {
      this.sidebarVisible = true;
      this.changeText('Workspace-Menü schließen');
      if (window.innerWidth < 1500 && this.thread_open == true) this.thread_open = false;
    }
  }

  /**
   * Changes the displayed text for the sidebar toggle button.
   * @param {string} text - The new text to display on the toggle button.
   */
  changeText(text: string) {
    this.toggleSidebarMenuText = text;
  }
}
