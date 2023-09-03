import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, updateDoc, getDocs, onSnapshot, DocumentData } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChannelService } from './channel.service';
import { getStorage } from "firebase/storage";
import { User, onAuthStateChanged } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  
  private authInitializedPromise: Promise<void>;
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private auth = getAuth();
  db = getFirestore();
  userData: any = [];
  signIn_successful: boolean
  signIn_error: boolean
  email_error: boolean
  signUp_successful: boolean
  userName: string
  addCertainUserValue = new BehaviorSubject<string>('');
  email_send: boolean = null;
  googleUser_exist: boolean;
  all_users: any[];
  usersPromise: Promise<any>;

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    private router: Router,
    public channelService: ChannelService,
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        setTimeout(() => this.getUserData(user.uid), 500);
        this.channelService.getAuthorizedChannels(user.uid);
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
    });


    
    this.usersPromise = new Promise<void>((resolve) => {
      const dbRef = collection(this.db, "users");
      onSnapshot(dbRef, docsSnap => {
        const users: any[] = [];
        docsSnap.forEach(doc => {
          users.push(doc.data())
        })
        this.all_users = users;
        resolve();
      });
    });


    this.authInitializedPromise = new Promise<void>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUserSubject.next(user);
        resolve();
      });
    });
  }


  async waitUntilAuthInitialized(): Promise<void> {
    return this.authInitializedPromise;
  }


  getUid() {
    const auth = getAuth();
    const user = auth.currentUser;
    return user.uid;
  }


  async getUserData(uid: string) {
    const userRef = doc(this.db, "users", uid);
    let docSnap = await getDoc(userRef);
    this.userData = docSnap.data()
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
      if (error.code === 'auth/email-already-in-use') {
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
      this.setOnlineStatus(email, 'Aktiv')
      setTimeout(() => this.signIn_successful = false, 3000);
      this.channelService.loadStandardChannel()
    } catch (error) {
      this.signIn_error = true
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }


  async setOnlineStatus(email: string, status: string) {
    const user = this.all_users.find(element => element.email === email);
    const userRef = doc(this.db, 'users', user.uid);
    await updateDoc(userRef, {
      status: status
    });
  }


  // Sign in with Google
  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider());
  }


  async AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
    try {
      const result = await this.afAuth.signInWithPopup(provider);
      this.userName = result.user.displayName;
      await this.isEmailRegistered(result.user.email, result.user)
      this.signIn_successful = true;
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      window.alert(error.message);
    }
  }


  async isEmailRegistered(email: string, user: firebase.User) {
    (await this.getAllUsers()).forEach(element => {
      if (element.email == email) {
        this.googleUser_exist = true
        this.setOnlineStatus(email, 'Aktiv')
        this.channelService.loadStandardChannel()
        return
      }
    });
    if (this.googleUser_exist != true) await this.SetUserData(user);
  }


  async ForgotPassword(passwordResetEmail: string) {
    await this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.email_send = true
        setTimeout(() => this.email_send = null, 3000);
      })
      .catch((error) => {
        this.email_send = false
        setTimeout(() => this.email_send = null, 3000);
      });
  }


  async SetUserData(user: any) {
    this.channelService.addUserToChannel('allgemein', user.uid)
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userDataFirestore = {
      uid: user.uid,
      email: user.email,
      user_name: this.userName,
      avatar: '/assets/img/big_avatar/81. Profile.png',
      status: ''
    };
    await userRef.set(userDataFirestore, {
      merge: true,
    });
    this.getUserData(user.uid)
  }


  async signOut() {
    await this.setOnlineStatus(this.userData.email, 'Abwesend')
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigateByUrl('/sign-in');
    this.userData = []
  }


  async getAllUsers() {
    const usersSnapshot = await getDocs(collection(this.db, 'users'));
    let users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }
  

  getUserInfo(uid: string) {
    const user = this.all_users.find(user => user.uid === uid);
    return user;
  }


  async filterUsers(name: string): Promise<any[]> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUser;
  }


  async filterUsersByEmail(email: string): Promise<any> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.email?.toLowerCase().startsWith(email?.toLowerCase())
    );
    return filteredUser;
  }


  async usersWithoutCurrentuser() {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(user => user.user_name === this.userData.user_name);
    if (userIndex !== -1) users.splice(userIndex, 1);
    return users
  }


  updateCertainUserValue(value: string): void {
    this.addCertainUserValue.next(value);
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


  async setAvatarImage(image: string) {
    const docRef = doc(this.db, "users", this.getUid());
    await updateDoc(docRef, {
      avatar: image
    });
    this.getUserData(this.getUid())
  }


  getImageUrl(uid: string): string {
    const user = this.all_users.find(element => element.uid === uid);
    return user.avatar
  }
}
