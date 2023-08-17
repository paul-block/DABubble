import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, orderBy, query, getDocs, deleteDoc } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { DirectChatService } from './directchat.service';
import { AuthenticationService } from './authentication.service';
import { EmojiService } from './emoji.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  db = getFirestore();
  previousMessageDate = null;
  messageText: string = '';
  messageID: string = '';
  editMessageText = false;
  readyToSend: boolean = false;
  messageDateRange: string = '';
  emoji_data = [];

  constructor(
    public directChatService: DirectChatService,
    public authService: AuthenticationService,
    public emojiService: EmojiService,
  ) { }


  checkIfEmpty() {
    if (this.messageText.length) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

  async newMessage() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (this.directChatService.currentChatID === 'noChatSelected') {
      console.log(this.directChatService.currentChatID);
    } else {
      console.log(this.messageText);

      const messagesCollectionRef = await addDoc(collection(this.db, 'chats', this.directChatService.currentChatID, 'messages'), {
        chat_message: this.messageText,
        user_Sender_ID: user.uid,
        user_Sender_Name: await this.authService.userData.user_name,
        created_At: firebase.firestore.FieldValue.serverTimestamp(),
        chat_message_edited: false,
        avatar: '',
        emoji_data: [],
      })

      const newMessageID = messagesCollectionRef.id;
      await updateDoc(messagesCollectionRef, {
        message_ID: newMessageID,
      }).then(() => {
        this.messageText = '';
      });

      this.getMessages();
    }
  }

  async getMessages() {
    this.emojiService.resetInitializedEmojiRef();
    this.directChatService.directChatMessages = [];
    this.previousMessageDate === null
    const chatMessagesRef = collection(this.db, 'chats', this.directChatService.currentChatID, 'messages');
    const docDirectChatMessagesSnapshot = await getDocs(query(chatMessagesRef, orderBy("created_At", "asc")));


    docDirectChatMessagesSnapshot.forEach((doc) => {
      const userData = doc.data();
      this.directChatService.directChatMessages.push(userData);
    });
  }

  async editMessage(chatMessage) {
    this.messageID = chatMessage.message_ID;
    this.editMessageText = true;
    this.messageText = chatMessage.chat_message;
  }

  async saveEditedMessage() {
    try {
      const messageRef = doc(this.db, 'chats', this.directChatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef, {
        chat_message: this.messageText,
        chat_message_edited: true
      }).then(() => {
        this.messageText = '';
        this.editMessageText = false;
        this.getMessages();
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }

  async deleteMessage(chatMessage) {
    this.messageID = chatMessage.message_ID;
    try {
      const messageRef = doc(this.db, 'chats', this.directChatService.currentChatID, 'messages', this.messageID);
      await deleteDoc(messageRef).then(() => {
        this.getMessages();
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  getTimestampTime(timestamp) {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }

  

  async updateMessagesReactions(chatMessage) {
    const docRef = doc(this.db, 'chats', this.directChatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(docRef, {
      emoji_data: this.emoji_data,
    }).then(() => {
      console.log(chatMessage.message_ID);

    });
  }


  formatDate(timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return 'Heute';
    } else {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return date.toLocaleDateString('de-DE', options);
    }
  }
  
}
