import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getFirestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  db = getFirestore();
  dbRef = collection(this.db, "users");
  test = {
    test: 'test'
  }

  constructor(private auth: Auth) { }

  updateData() {
    addDoc(this.dbRef, this.test)
  }
}
