import { Injectable, OnInit } from '@angular/core';
import { getDocs } from '@angular/fire/firestore';
import { getFirestore, collection, addDoc } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FirestoreThreadDataService {

  db = getFirestore();
  dbRef_thread = collection(this.db, "threads");
  dbRef_message = collection(this.db, "channel_messages");
  thread = [];
  channel_messages = [];
  thread_open: boolean;

  constructor() { }

  async saveThread(data) {
    let thread_data = {
      comments: [],
      thread_id: ''
    }
    thread_data.comments = data
    await addDoc(this.dbRef_thread, thread_data)
  }

  async getMessages() {
    const colRef = collection(this.db, "channel_messages");
    const docsSnap = await getDocs(colRef);
    docsSnap.forEach(doc => {
      this.channel_messages.push(doc.data());
    })
  }


  openThread(i) {
    this.thread_open = true
  }
}



