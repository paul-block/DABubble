import { Injectable } from '@angular/core';
import { doc, getDoc, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import * as firebase from 'firebase/compat';
import { getFirestore, collection } from "firebase/firestore";
import { AuthenticationService } from './authentication.service';




@Injectable({
  providedIn: 'root'
})

export class FirestoreThreadDataService {

  
  db = getFirestore();
  dbRef_thread = collection(this.db, "threads");
  dbRef_message = collection(this.db, "channel_messages");
  channel_messages = [];
  thread_open: boolean = false
  current_message: any;
  current_message_id: string;
  comments:any[] = []


  constructor( public authenticationService: AuthenticationService) { }


  async saveThread(data) {
  this.comments.push(data)
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
  }


  async updateData() {
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
  }



  async getMessages() {
    this.channel_messages = []
    const colRef = collection(this.db, "channel_messages");
    const docsSnap = await getDocs(colRef);
    docsSnap.forEach(doc => {
      this.channel_messages.push(doc.data());
    })
  }


  async openThread(i: never) {
    this.thread_open = true
    this.current_message = this.channel_messages[i].message
    this.validateIdFromMessage(i);
    this.loadThread();
  }



  validateIdFromMessage(i: number) {
    this.current_message_id = this.channel_messages[i].id
  }


  async loadThread() {
    const docRef = doc(this.db, "threads", this.current_message_id);
    const docSnap = await getDoc(docRef);
    if (docSnap.data() == undefined) {
      let thread_data = {
        comments: []
      }
      await setDoc(docRef, thread_data);
    } else {
      this.comments = docSnap.data().comments
    }
  }


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
     else if (minutes > 1)   return ` vor ${minutes} Minuten `;
     else if (minutes == 1)   return ` vor ${minutes} Minute `;
     else return `gerade eben`;
  }
}










