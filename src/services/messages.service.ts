import { Injectable } from '@angular/core';
import { doc, getFirestore, updateDoc, collection, orderBy, query, deleteDoc, getDoc, onSnapshot, setDoc, DocumentData } from '@angular/fire/firestore';
import { ChatService } from './chat.service';
import { AuthenticationService } from './authentication.service';
import { EmojiService } from './emoji.service';
import { Subject } from 'rxjs/internal/Subject';
import { GeneralFunctionsService } from './general-functions.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from 'app/dialog-delete-comment/dialog-delete-comment.component';

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
  private scrollSubjectThread = new Subject<void>();
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
  ) { }

/**
 * Checks if there's text input and if a chat is selected or a new message component is open.
 * Updates the `readyToSend` boolean accordingly.
 */
  checkIfEmpty() {
    if (this.messageText.length > 0 && this.chatService.currentChatID !== 'noChatSelected' || this.chatService.openNewMsgComponent) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

/**
 * Adds a new message to the Firestore database.
 * @returns {Promise<void>} Resolves when the message has been successfully added.
 */
  async newMessage() {
    return new Promise<void>(async (resolve) => {
      let time_stamp = new Date();
      const customMessageID = await this.genFunctService.generateCustomFirestoreID();
      await setDoc(doc(collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages'), customMessageID),
        this.newMessageData(time_stamp, customMessageID)
      ).then(() => {
        this.messageText = '';
      });
      resolve();
    });
  }

/**
 * Structures the data for a new chat message.
 * @param {Date} time_stamp - The timestamp of the message.
 * @param {string} customMessageID - The unique identifier for the message.
 * @returns An object containing structured chat message data.
 */
  newMessageData(time_stamp, customMessageID) {
    return {
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
    }
  }

/**
 * Updates the count of answers for a given message.
 * @param {string} id - The identifier for the message.
 */
  async saveNumberOfAnswers(id: string) {
    await this.getNumberOfAnswers(id)
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
    const data = {
      answers: this.answers_count,
      last_answer: this.time
    };
    updateDoc(messageRef, data);
  }

/**
 * Retrieves the number of answers for a given message ID.
 * @param {string} id - The identifier for the message.
 */
  async getNumberOfAnswers(id: string) {
    const docRef = doc(this.db, "threads", id);
    const docSnap = await getDoc(docRef);
    this.answers_count = docSnap.data().comments.length
    if (this.answers_count > 0) this.time = docSnap.data().comments[this.answers_count - 1].time.seconds
    else this.time = 0
  }

/**
 * Fetches all messages.
 * @returns A promise that resolves once all messages have been fetched.
 */
  async getMessages(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.prepareForGetMessages();
      const docChatMessagesSnapshot = this.getChatMessagesSnapshot();
      this.chatSnapshotUnsubscribe = onSnapshot(docChatMessagesSnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          this.reactToChange(change);
        });
        this.messagesLoaded = true;
        resolve();
      });
    });
  }

/**
 * Prepares necessary variables and state before fetching messages.
 */
  prepareForGetMessages() {
    if (this.chatSnapshotUnsubscribe) this.chatSnapshotUnsubscribe();
    this.messagesLoaded = false;
    this.emojiService.resetInitializedEmojiRef();
    this.chatService.directChatMessages = [];
  }

/**
 * Retrieves the snapshot of chat messages.
 * @returns A snapshot of chat messages ordered by creation time.
 */
  getChatMessagesSnapshot() {
    const chatMessagesRef = collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages');
    return query(chatMessagesRef, orderBy("created_At", "asc"));
  }

/**
 * Processes changes to chat messages.
 * @param {DocumentChange} change - The change data from Firestore.
 */
  reactToChange(change) {
    const changedMessageData = change.doc.data();
    if (change.type === 'added') this.chatService.directChatMessages.push(changedMessageData);
    else if (change.type === 'modified') this.getChangedMessage(changedMessageData);
    else if (change.type === 'removed') this.spliceMessage(changedMessageData);
  }

/**
 * Updates the message with any new data.
 * @param {DocumentData} changedMessageData - The new data for the message.
 */
  async getChangedMessage(changedMessageData: DocumentData) {
    let changedChatMessage = this.chatService.directChatMessages.find(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    for (const variable in changedMessageData) {
      if (changedMessageData.hasOwnProperty(variable)) {
        changedChatMessage[variable] = changedMessageData[variable];
      }
    }
  }

/**
 * Removes a message from the current chat messages array.
 * @param {DocumentData} changedMessageData - The data of the message to be removed.
 */
  async spliceMessage(changedMessageData: DocumentData) {
    const index = this.chatService.directChatMessages.findIndex(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    if (index !== -1) {
      this.chatService.directChatMessages.splice(index, 1);
    }
  }

/**
 * Initiates a scroll to the bottom action based on the section.
 * @param {string} section - The chat section to scroll.
 */
  scrollToBottom(section: string) {
    if (section == 'thread') setTimeout(() => this.scrollSubjectThread.next(), 0);
    else setTimeout(() => this.scrollSubject.next(), 0);
  }

/**
 * Gets an observable for the scroll action.
 * @returns An observable for the scroll action.
 */
  get scrollObservable() {
    return this.scrollSubject.asObservable();
  }

/**
 * Gets an observable for the scroll action within a thread.
 * @returns An observable for the thread's scroll action.
 */
  get scrollObservableThread() {
    return this.scrollSubjectThread.asObservable();
  }

/**
 * Sets up the data for editing a message.
 * @param {number} i - Index of the message.
 * @param {object} chatMessage - The chat message object.
 */
  async editMessage(i: number, chatMessage: { message_ID: string; chat_message: string; }) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    this.editMessageText = true;
    this.messageText = chatMessage.chat_message;
  }

/**
 * Saves any edits made to a message.
 */
  async saveEditedMessage() {
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef,
        this.editedMessageData(this.messageText, true, this.chatService.modifyMessageValue(this.messageText))
      ).then(() => {
        this.messageText = '';
        this.editMessageText = false;
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }

/**
 * Saves edits made to a message within a thread.
 * @param {object} chat - The chat message object.
 */
  async saveEditedMessageFromThread(chat: { message_ID: any; chat_message: any; chat_message_edited: any; modified_message: any; }) {
    let id = chat.message_ID;
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
    await updateDoc(messageRef,
      this.editedMessageData(chat.chat_message, chat.chat_message_edited, chat.modified_message)
    )
  }

/**
 * Constructs the data for an edited message.
 * @param {string} chatMessage - The edited message text.
 * @param {boolean} chatMessageEdited - Indicator if the message was edited.
 * @param {string} modifiedMessage - The modified message after any transformations.
 * @returns An object with structured edited message data.
 */
  editedMessageData(chatMessage, chatMessageEdited, modifiedMessage) {
    return {
      chat_message: chatMessage,
      chat_message_edited: chatMessageEdited,
      modified_message: modifiedMessage,
    }
  }

/**
 * Deletes a message based on its index and data.
 * @param {number} i - Index of the message.
 * @param {object} chatMessage - The chat message object.
 */
  async deleteMessage(i: number, chatMessage) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await deleteDoc(messageRef)
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

/**
 * Opens a dialog to confirm the deletion of a message.
 * @param {number} i - Index of the message.
 * @param {object} chatMessage - The chat message object.
 */
  openDeleteMessage(i: number, chatMessage: { chat_message: any; answers: number; }) {
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      data: { comment: chatMessage.chat_message },
      panelClass: 'my-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result || result == '') {
        chatMessage.chat_message = result;
        if (chatMessage.answers == 0) {
          this.deleteMessage(i, chatMessage)
          this.chatService.thread_open = false
        }
        else this.changeMessageToDeleted(chatMessage)
      }
    });
  }

/**
 * Updates a message to show that it has been deleted.
 * @param {object} chatMessage - The chat message object.
 */
  async changeMessageToDeleted(chatMessage) {
    chatMessage.chat_message = 'Diese Nachricht wurde gelöscht.'
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(messageRef, {
      chat_message: chatMessage.chat_message,
      message_deleted: true
    })
  }

/**
 * Converts a timestamp to a formatted time.
 * @param {object} timestamp - The timestamp to format.
 * @returns The formatted time string.
 */
  getTimestampTime(timestamp: { toDate: () => any; }) {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }

/**
 * Updates the reactions on a chat message.
 * @param {object} chatMessage - The chat message object.
 */
  async updateMessagesReactions(chatMessage: { message_ID: string; }) {
    const docRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(docRef, {
      emoji_data: this.emoji_data,
    });
  }

/**
 * Converts a timestamp to a formatted date string.
 * @param {object} timestamp - The timestamp to format.
 * @returns The formatted date string.
 */
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

/**
 * Clears the message text field.
 */
  emptyMessageText() {
    this.messageText = '';
  }

/**
 * Updates the uploaded files for a message.
 * @param {number} i - Index of the message.
 * @param {number} k - Index of the file within the message's uploaded files.
 */
  updateUploadedFiles(i: number, k: number) {
    this.chatService.directChatMessages[i].uploaded_files.file_name.splice(k, 1);
    this.chatService.directChatMessages[i].uploaded_files.download_link.splice(k, 1);
    this.messageID = this.chatService.directChatMessages[i].message_ID;
    this.saveEditedUploads(i);
  }

/**
 * Updates the uploaded files of a message and handles conditions for deletion or changing to "deleted" status.
 * @param {number} i - Index of the message in the `directChatMessages` array.
 */
  async saveEditedUploads(i: number) {
    let message = this.chatService.directChatMessages[i]
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef, {
        uploaded_files: this.chatService.directChatMessages[i].uploaded_files,
      })
      if (message.uploaded_files.file_name.length == 0 && message.chat_message == '' && message.answers == 0) this.deleteMessage(i, message)
      if (message.answers > 0 && message.uploaded_files.file_name.length == 0 && message.chat_message == '') this.changeMessageToDeleted(message)
    } catch (error) {
      console.error('Error updating files:', error);
    }
  }
}
