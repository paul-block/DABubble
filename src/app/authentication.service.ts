import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { getFirestore, collection, addDoc } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  db = getFirestore();
  dbRef = collection(this.db, "users");
  userData: any
  signIn_successful:boolean
  signIn_error:boolean
  
 

  constructor(private auth: Auth, public afAuth: AngularFireAuth) { 
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

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
        this.signIn_successful = true
        setTimeout(() => this.signIn_successful = false, 2000);
    } catch (error) {
      
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
      this.signIn_successful = true
      setTimeout(() => this.signIn_successful = false, 2000);
    } catch (error) {
      this.signIn_error = true
      setTimeout(() => this.signIn_error = false, 2000);
    }
  }


  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
}
