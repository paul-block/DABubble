import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getFirestore, collection, addDoc } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  [x: string]: any;
  db = getFirestore();
  dbRef = collection(this.db, "users");
  user = {
    name: ''
  }

  constructor(private auth: Auth, public afAuth: AngularFireAuth) { }

  // Sign up with email/password
  async SignUp(email: string, password: string) {
    console.log(email, password);

    try {
      const result = await this.afAuth
        .createUserWithEmailAndPassword(email, password);
      window.alert('You have been successfully registered!');
      console.log(result.user);
    } catch (error) {
      window.alert(error.message);
    }
  }
  // Sign in with email/password
  async SignIn(email: string, password: string) {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword(email, password);
      console.log(result);
    } catch (error) {
      window.alert(error.message);
    }
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }


  async AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
    try {
      const result = await this.afAuth
        .signInWithPopup(provider);
      console.log('You have been successfully logged in!');
    } catch (error) {
      console.log(error);
    }
  }
}
