import { ElementRef, Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { doc, getFirestore, updateDoc, collection, addDoc, orderBy, query, getDocs, deleteDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';
import { DirectChatService } from './directchat.service';
import { AuthenticationService } from './authentication.service';
import { EmojiService } from './emoji.service';
import { Subject } from 'rxjs/internal/Subject';

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
  messageIndex: number = null;
  private scrollSubject = new Subject<void>();
  answers_count: any;
  time: any;

  constructor(
    public directChatService: DirectChatService,
    public authService: AuthenticationService,
    public emojiService: EmojiService,
  ) { }


  checkIfEmpty() {
    if (this.messageText.length && this.directChatService.currentChatID !== 'noChatSelected') {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

  async newMessage() {
    const auth = getAuth();
    const user = auth.currentUser;

    const messagesCollectionRef = await addDoc(collection(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages'), {
      chat_message: this.messageText,
      user_Sender_ID: user.uid,
      user_Sender_Name: await this.authService.userData.user_name,
      created_At: firebase.firestore.FieldValue.serverTimestamp(),
      chat_message_edited: false,
      emoji_data: [],
      answers: 0,
      last_answer: ''
    })

    const newMessageID = messagesCollectionRef.id;
    await updateDoc(messagesCollectionRef, {
      message_ID: newMessageID,
    }).then(() => {
      this.getNewMessage();
      this.messageText = '';
    });


  }

  async saveNumberOfAnswers(id: string) {
    await this.getNumberOfAnswers(id)
    const messageRef = doc(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages', id);
    const data = {
      answers: this.answers_count,
      last_answer: this.time
    };
    updateDoc(messageRef, data);
  }


  async getNumberOfAnswers(id: string) {
    const docRef = doc(this.db, "threads", id);
    const docSnap = await getDoc(docRef);
    this.answers_count = docSnap.data().comments.length
    this.time = docSnap.data().comments[this.answers_count - 1].time.seconds
  }


  async getNewMessage() {
    const chatMessagesRef = collection(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages');
    const docDirectChatMessagesSnapshot = await getDocs(query(chatMessagesRef, orderBy("created_At", "asc")));
    const latestDocument = docDirectChatMessagesSnapshot.docs[docDirectChatMessagesSnapshot.docs.length - 1].data();
    this.directChatService.directChatMessages.push(latestDocument);
    this.scrollToBottom();
  }

  async getChangedMessage() {
    const currentMessage = this.directChatService.directChatMessages[this.messageIndex];
    currentMessage.chat_message = this.messageText;
    currentMessage.chat_message_edited = true;
  }


  async getMessages() {
    this.emojiService.resetInitializedEmojiRef();
    this.directChatService.directChatMessages = [];
    this.previousMessageDate === null
    const chatMessagesRef = collection(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages');
    const docDirectChatMessagesSnapshot = await getDocs(query(chatMessagesRef, orderBy("created_At", "asc")));

    docDirectChatMessagesSnapshot.forEach((doc) => {
      const userData = doc.data();
      this.directChatService.directChatMessages.push(userData);
    });
    this.scrollToBottom()
  }

  scrollToBottom() {
    setTimeout(() => {
      this.scrollSubject.next();
    }, 0);
  }

  get scrollObservable() {
    return this.scrollSubject.asObservable();
  }

  async editMessage(i: number, chatMessage) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    this.editMessageText = true;
    this.messageText = chatMessage.chat_message;
  }

  async saveEditedMessage() {
    try {
      this.getChangedMessage();
      const messageRef = doc(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages', this.messageID);

      await updateDoc(messageRef, {
        chat_message: this.messageText,
        chat_message_edited: true
      }).then(() => {
        this.messageText = '';
        this.editMessageText = false;

      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }


  async saveEditedMessageFromThread(chat) {
    let id = chat.message_ID
    let message = chat.chat_message
    let edited = chat.chat_message_edited
    const messageRef = doc(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages', id);
    await updateDoc(messageRef, {
      chat_message: message,
      chat_message_edited: edited
    })
  }


  async deleteMessage(i: number, chatMessage) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    try {
      this.spliceMessage();
      const messageRef = doc(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages', this.messageID);
      await deleteDoc(messageRef)
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  async spliceMessage() {
    this.directChatService.directChatMessages.splice(this.messageIndex, 1);
  }

  getTimestampTime(timestamp) {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }



  async updateMessagesReactions(chatMessage) {
    const docRef = doc(this.db, this.directChatService.currentChatSection, this.directChatService.currentChatID, 'messages', chatMessage.message_ID);
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
