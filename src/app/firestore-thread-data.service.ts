import { Injectable } from '@angular/core';
import { doc, getDoc, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import * as firebase from 'firebase/compat';
import { getFirestore, collection } from "firebase/firestore";




@Injectable({
  providedIn: 'root'
})

export class FirestoreThreadDataService {


  db = getFirestore();
  dbRef_thread = collection(this.db, "threads");
  dbRef_message = collection(this.db, "channel_messages");
  channel_messages = [];
  thread_open: boolean;
  current_message: any;
  current_message_id: string;
  comments = []



  constructor() {}


  async saveThread(data: { comment: string; user: any; time: Date; avatar: string; emoji_data: any[]; }) {
    this.comments.push(data)
    console.log(this.comments);

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
      const docRef = doc(this.db, "threads", this.current_message_id);
      this.comments = docSnap.data().comments
      console.log(this.comments);

    }
  }
}




