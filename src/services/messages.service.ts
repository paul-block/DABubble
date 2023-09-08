import { Injectable } from '@angular/core';
import { doc, getFirestore, updateDoc, collection, orderBy, query, deleteDoc, getDoc, onSnapshot, setDoc, DocumentData } from '@angular/fire/firestore';
import { ChatService } from './chat.service';
import { AuthenticationService } from './authentication.service';
import { EmojiService } from './emoji.service';
import { Subject } from 'rxjs/internal/Subject';
import { GeneralFunctionsService } from './general-functions.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from 'app/dialog-delete-comment/dialog-delete-comment.component';
import { FirestoreThreadDataService } from './firestore-thread-data.service';


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
  upload_array: any;
  messagesLoaded: boolean = false;
  private chatSnapshotUnsubscribe: () => void;

  constructor(
    public dialog: MatDialog,
    public chatService: ChatService,
    public authService: AuthenticationService,
    public emojiService: EmojiService,
    public genFunctService: GeneralFunctionsService,
  ) {
  }


  checkIfEmpty() {
    if (this.messageText.length && this.chatService.currentChatID !== 'noChatSelected' || this.chatService.openNewMsgComponent) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

  async newMessage() {
    let time_stamp = new Date();
    const customMessageID = await this.genFunctService.generateCustomFirestoreID();

    await setDoc(doc(collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages'), customMessageID), {
      chat_message: this.messageText,
      user_Sender_ID: this.authService.userData.uid,
      user_Sender_Name: this.authService.userData.user_name,
      created_At: time_stamp,
      chat_message_edited: false,
      emoji_data: [],
      modified_message: this.chatService.modifyMessageValue(this.messageText),
      answers: 0,
      last_answer: '',
      uploaded_files: this.upload_array,
      message_ID: customMessageID
    }).then(() => {
      this.messageText = '';
    });
  }


  async saveNumberOfAnswers(id: string) {
    await this.getNumberOfAnswers(id)
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
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
    if (this.answers_count > 0) this.time = docSnap.data().comments[this.answers_count - 1].time.seconds
    else this.time = 0
  }


  async getMessages() {
    if (this.chatSnapshotUnsubscribe) {
      this.chatSnapshotUnsubscribe();
    }
    this.messagesLoaded = false;
    this.emojiService.resetInitializedEmojiRef();
    this.chatService.directChatMessages = [];

    const chatMessagesRef = collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages');
    const docDirectChatMessagesSnapshot = query(chatMessagesRef, orderBy("created_At", "asc"));
    this.chatSnapshotUnsubscribe = onSnapshot(docDirectChatMessagesSnapshot, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const changedMessageData = change.doc.data();
        if (change.type === 'added') {
          this.chatService.directChatMessages.push(changedMessageData);
        } else if (change.type === 'modified') {
          this.getChangedMessage(changedMessageData);
        } else if (change.type === 'removed') {
          this.spliceMessage(changedMessageData);
        }
      });
      this.messagesLoaded = true;
    });
  }


  async getChangedMessage(changedMessageData: DocumentData) {
    let changedChatMessage = this.chatService.directChatMessages.find(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    for (const variable in changedMessageData) {
      if (changedMessageData.hasOwnProperty(variable)) {
        changedChatMessage[variable] = changedMessageData[variable];
      }
    }
  }


  async spliceMessage(changedMessageData: DocumentData) {
    const index = this.chatService.directChatMessages.findIndex(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    if (index !== -1) {
      this.chatService.directChatMessages.splice(index, 1);
    }
  }


  scrollToBottom() {
    setTimeout(() => {
      this.scrollSubject.next();
    }, 0);
  }


  get scrollObservable() {
    return this.scrollSubject.asObservable();
  }


  async editMessage(i: number, chatMessage: { message_ID: string; chat_message: string; }) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    this.editMessageText = true;
    this.messageText = chatMessage.chat_message;
  }


  async saveEditedMessage() {
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef, {
        chat_message: this.messageText,
        chat_message_edited: true,
        modified_message: this.chatService.modifyMessageValue(this.messageText),
      }).then(() => {
        this.messageText = '';
        this.editMessageText = false;

      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }


  async saveEditedMessageFromThread(chat: { message_ID: any; chat_message: any; chat_message_edited: any; modified_message: any; }) {
    let id = chat.message_ID
    let message = chat.chat_message
    let edited = chat.chat_message_edited
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
    await updateDoc(messageRef, {
      chat_message: message,
      chat_message_edited: edited,
      modified_message: chat.modified_message
    })
  }


  async deleteMessage(i: number, chatMessage) {
    console.log(chatMessage);
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await deleteDoc(messageRef)
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }


  openDeleteMessage(i: number, chatMessage: { chat_message: any; answers: number; }) {
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      data: { comment: chatMessage.chat_message },
      panelClass: 'my-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result || result == '') {
        chatMessage.chat_message = result;
        if (chatMessage.answers == 0) this.deleteMessage(i, chatMessage)
        else this.changeMessageToDeleted(chatMessage)
      }
    });
  }


  async changeMessageToDeleted(chatMessage) {
    chatMessage.chat_message = 'Diese Nachricht wurde gelöscht.'
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(messageRef, {
      chat_message: chatMessage.chat_message,
      message_deleted: true
    })
  }


  getTimestampTime(timestamp: { toDate: () => any; }) {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }


  async updateMessagesReactions(chatMessage: { message_ID: string; }) {
    const docRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(docRef, {
      emoji_data: this.emoji_data,
    }).then(() => {
      console.log(chatMessage.message_ID);

    });
  }


  formatDate(timestamp: { toDate: () => any; }): string {
    const date = timestamp.toDate();
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return 'Heute';
    } else {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return date.toLocaleDateString('de-DE', options);
    }
  }

  emptyMessageText() {
    this.messageText = '';
  }

  updateUploadedFiles(i: number, k: number) {
    console.log(this.chatService.directChatMessages[i]);
    this.chatService.directChatMessages[i].uploaded_files.file_name.splice(k, 1);
    this.chatService.directChatMessages[i].uploaded_files.download_link.splice(k, 1);
    this.messageID = this.chatService.directChatMessages[i].message_ID;
    this.saveEditedUploads(i);
  }

  async saveEditedUploads(i: number) {
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef, {
        uploaded_files: this.chatService.directChatMessages[i].uploaded_files,
      })
    } catch (error) {
      console.error('Error updating files:', error);
    }
  }
}
