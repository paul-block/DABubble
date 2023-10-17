import { Injectable } from '@angular/core';
import { deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { getFirestore, collection } from "firebase/firestore";
import { AuthenticationService } from './authentication.service';
import { ChatService } from './chat.service';
import { MessagesService } from './messages.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FirestoreThreadDataService {
  db = getFirestore();
  dbRef_thread = collection(this.db, "threads");
  dbRef_message = collection(this.db, "channel_messages");
  channel_messages = [];
  current_message: any;
  current_message_id: string;
  comments: any[] = []
  detailsVisible: boolean = false;
  chat_user: string
  subscription: Subscription | undefined;
  current_changed_index: number
  fake_array = []
  chat_type: string;
  current_chat_data: any;
  direct_chat_index: number;
  current_channelname: any;
  window_width = window.innerWidth


  constructor(
    public authenticationService: AuthenticationService,
    private chatService: ChatService,
    private messageSevice: MessagesService,
  ) { }

/**
 * Saves a new comment to the thread.
 * 
 * @param {any} data - Comment data to be saved.
 */
  async saveThread(data) {
    this.comments.push(data)
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
    if (this.chat_type == 'direct') this.messageSevice.saveNumberOfAnswers(this.current_message_id)
    this.messageSevice.scrollToBottom('thread')
  }

/**
 * Updates the current thread's data.
 */
  async updateData() {
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
    if (this.chat_type == 'direct') this.messageSevice.saveNumberOfAnswers(this.current_message_id)
  }

/**
 * Fetches and sets all messages related to a channel.
 */
  async getMessages() {
    this.channel_messages = []
    const colRef = collection(this.db, "channel_messages");
    const docsSnap = await getDocs(colRef);
    docsSnap.forEach(doc => {
      this.channel_messages.push(doc.data());
    })
  }

/**
 * Opens a thread for the selected message in a channel.
 * 
 * @param {number} i - The index of the selected message.
 */
  async openThread(i: number) {
    this.chat_type = 'channel'
    this.chatService.thread_open = true
    this.current_message = this.channel_messages[i].message
    this.validateIdFromMessage(i);
  }

/**
 * Opens a thread for the selected message in a direct chat.
 * 
 * @param {number} i - The index of the selected message.
 */
  openDirectChatThread(i: number) {
    this.chatService.thread_open = true
    if (this.window_width < 1300 && this.window_width > 1000) {
      if (this.chatService.sidebarVisible) this.chatService.sidebarVisible = false
    }
    this.current_channelname = this.chatService.currentChatData.channelName
    this.current_chat_data = this.chatService.directChatMessages[i]
    this.direct_chat_index = i
    this.current_message = this.chatService.directChatMessages[i].modified_message
    this.current_message_id = this.chatService.directChatMessages[i].message_ID
    this.loadThread(this.current_message_id).then(() => {
      this.chat_type = 'direct'
      this.messageSevice.scrollToBottom('thread')
    });
  }

/**
 * Validates and sets the ID for the current message.
 * 
 * @param {number} i - The index of the selected message.
 */
  validateIdFromMessage(i: number) {
    this.current_message_id = this.channel_messages[i].id
    this.loadThread(this.current_message_id)
  }

/**
 * Calculates the time since the provided timestamp and returns a human-readable string.
 * 
 * @param {number} timestamp - The original timestamp.
 * @returns {string} - A human-readable string indicating the time since the original timestamp.
 */
  getTimeSince(timestamp: number) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const timeDifference = nowInSeconds - timestamp;
    const seconds = timeDifference % 60;
    const minutes = Math.floor((timeDifference / 60) % 60);
    const hours = Math.floor((timeDifference / 3600) % 24);
    const days = Math.floor(timeDifference / 86400);
    if (days > 1) return `vor ${days} Tagen`;
    else if (days == 1) return `vor ${days} Tag`;
    else if (hours == 1) return `vor ${hours} Stunde`;
    else if (hours > 1) return `vor ${hours} Stunden`;
    else if (minutes > 1) return ` vor ${minutes} Minuten `;
    else if (minutes == 1) return ` vor ${minutes} Minute `;
    else return `gerade eben`;
  }

/**
 * Loads a thread based on the provided document ID.
 * 
 * @param {string} documentId - The ID of the thread to be loaded.
 * @returns {Promise<void>} - Resolves when the thread data is loaded.
 */
  async loadThread(documentId: string): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const docRef = doc(this.db, 'threads', documentId);
      onSnapshot(doc(this.db, "threads", documentId), async (doc) => {
        const changedData = doc.data();
        if (changedData) {
          this.comments = changedData.comments;
          this.fake_array.length = this.comments.length;
        } else {
          let thread_data = { comments: [] }
          await setDoc(docRef, thread_data);
        }
        resolve();
      });
    });
  }

/**
 * Deletes the current thread.
 */
  async deletThread() {
    const docRef = doc(this.db, 'threads', this.current_message_id);
    await deleteDoc(docRef);
  }

/**
 * Updates the thread by removing an uploaded file from a comment.
 * 
 * @param {number} i - The index of the comment.
 * @param {number} k - The index of the uploaded file in the comment.
 */
  updateThread(i: number, k: number) {
    this.comments[i].uploaded_files.file_name.splice(k, 1);
    this.comments[i].uploaded_files.download_link.splice(k, 1);
    this.updateData();
  }

/**
 * Formats a name string by highlighting it, and appends a text to it.
 * 
 * @param {string} name - The original name string.
 * @returns {string} - The formatted name with appended text.
 */
  formatNameAndText(name: string): string {
    const [firstName, lastName] = name.split(' ');
    const formattedName = `<span class="highlighted">@${firstName} ${lastName}</span>`;
    return `${formattedName} `;
  }
}
