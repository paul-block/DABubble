import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, arrayUnion, updateDoc, collection, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  db = getFirestore();
  userData: any = [];
  signIn_successful: boolean
  signIn_error: boolean
  email_error: boolean
  signUp_successful: boolean
  userName: string
  private channelList = new BehaviorSubject<string[]>(this.userData.channels || []);
  channelList$ = this.channelList.asObservable();
  private privateMessages = new BehaviorSubject<string[]>(this.userData.messages || []);
  privateMessages$ = this.privateMessages.asObservable();

  constructor(private auth: Auth, public afAuth: AngularFireAuth, public afs: AngularFirestore, private router: Router) {

    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.getUserData(user.uid)
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
    try {
      const result = await this.afAuth
        .createUserWithEmailAndPassword(email, password).then((result) => {
          this.SetUserData(result.user);
        })
      this.signUp_successful = true
      setTimeout(() => this.signUp_successful = false, 3000);
    } catch (error) {
      if (error.message == 'Firebase: Error (auth/email-already-in-use).') {
        this.email_error = true
        setTimeout(() => this.email_error = false, 3000);
      } else
        window.alert(error.message)
    }
  }


  // Sign in with email/password
  async SignIn(email: string, password: string) {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword(email, password)
      this.signIn_successful = true
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      this.signIn_error = true
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }


  // Sign in with Google
  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider());
  }


  async AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
    try {
      const result = await this.afAuth
        .signInWithPopup(provider).then((result) => {
          this.userName = result.user.displayName
          this.SetUserData(result.user);
        });
      this.signIn_successful = true
      setTimeout(() => this.signIn_successful = false, 2000);
    } catch (error) {
      window.alert(error.message);
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


  async SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      user_name: this.userName,
    };
    return await userRef.set(userData, {
      merge: true,
    });
  }


  async getUserData(uid: string) {
    const userRef = doc(this.db, "users", uid);
    let docSnap = await getDoc(userRef);
    this.userData = docSnap.data()
    console.log(this.userData);
  }


  async signOut() {
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigateByUrl('/sign-in');
    this.userData = []
  }

  async addChannel(channel: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      const userRef = doc(this.db, 'users', user.uid);

      return updateDoc(userRef, {
        channels: arrayUnion(channel)
      }).then(() => {
        this.getUserData(user.uid);
      });
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
    this.channelList.next(this.userData.channels || []);
  }

  async updateUserDetails(userName: string, email: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      const userRef = doc(this.db, 'users', user.uid);

      await updateDoc(userRef, {
        user_name: userName,
        email: email
      });
      this.userData.user_name = userName;
      this.userData.email = email;
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }

  async newMessage(message: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      const userRef = doc(this.db, 'users', user.uid, 'messages');

      return updateDoc(userRef, {
        messages: arrayUnion(message)
      }).then(() => {
        this.getUserData(user.uid);
      });
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
    this.privateMessages.next(this.userData.messages || []);
  }

}
