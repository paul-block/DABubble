import { Injectable, } from '@angular/core';
import { doc, getDocs, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { getFirestore, collection } from "firebase/firestore";
import { AuthenticationService } from './authentication.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { distinctUntilChanged, distinctUntilKeyChanged, takeUntil } from 'rxjs/operators';







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
  comments: any[] = []
  detailsVisible: boolean = false;
  selectedFile: File = null;
  current_changed_index: number
  fake_array = []



  constructor(public authenticationService: AuthenticationService,
    private storage: AngularFireStorage,
    private angularFireDatabase: AngularFireDatabase,
    private firestore: AngularFirestore
  ) {

  }




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


  async openThread(i: number) {
    this.thread_open = true
    this.current_message = this.channel_messages[i].message
    this.validateIdFromMessage(i);
  }



  validateIdFromMessage(i: number) {
    this.current_message_id = this.channel_messages[i].id
    this.loadThread(this.current_message_id)

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
    else if (minutes > 1) return ` vor ${minutes} Minuten `;
    else if (minutes == 1) return ` vor ${minutes} Minute `;
    else return `gerade eben`;
  }

  async onFileSelected(event: any) {

  }

  async loadThread(documentId: string) {
    const docRef = doc(this.db, 'threads', documentId);
    onSnapshot(doc(this.db, "threads", documentId), async (doc) => {
      const changedData = doc.data();
      if (changedData) {
        this.comments = changedData.comments
        this.fake_array.length = this.comments.length
      } else {
        let thread_data = {
          comments: []
        }
        await setDoc(docRef, thread_data);
      }
    });
  }
}









