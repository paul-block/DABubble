import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getDoc, getFirestore, updateDoc, collection, addDoc, orderBy, query, getDocs } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { DirectChatService } from './directchat.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  db = getFirestore();
  messageText: string = '';
  messageID: string = '';
  editMessageText = false;
  readyToSend: boolean = false;

  constructor(
    public directChatService: DirectChatService,
  ) { }

  checkIfEmpty() {
    if (this.messageText.length) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
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
        chat_message: this.messageText
      }).then(() => {
        this.messageText = '';
        this.editMessageText = false;
        this.directChatService.getMessages();
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }

  }
}
