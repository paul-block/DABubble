import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, updateDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';
import { User, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  userLoaded: Promise<void>;
  currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  auth = getAuth();
  db = getFirestore();
  userData: any = [];
  signIn_successful: boolean;
  signIn_error: boolean;
  email_error: boolean;
  signUp_successful: boolean;
  userName: string;
  email_send: boolean = null;
  googleUser_exist: boolean;
  all_users: any[];
  newUser: boolean = false;

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    private router: Router,
    public channelService: ChannelService,
  ) {
    this.setCurrentUserToLocalStorage();
    this.loadAllUsers();
    this.loadCurrentUser();
  }
  /**
   * Sets the current user data to local storage. 
   * When a user is detected via `authState`, the user data is stored in local storage. 
   * Additionally, authorized channels for the user are fetched.
   */
  async setCurrentUserToLocalStorage() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        setTimeout(() => {
          this.getUserData(user.uid).then(() => {
            this.channelService.getAuthorizedChannels(user.uid);
            localStorage.setItem('user', JSON.stringify(this.userData));
            this.setOnlineStatus(user.email, 'Aktiv');
          });
        }, 500);
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }


  /**
   * Loads all users from the Firestore "users" collection into `all_users` property. 
   * The method uses an observable pattern to get real-time updates from Firestore.
   * @returns {Promise<void>} Resolves when the users have been loaded.
   */
  async loadAllUsers() {
    return new Promise<void>((resolve) => {
      const dbRef = collection(this.db, "users");
      onSnapshot(dbRef, docsSnap => {
        const users: any[] = [];
        docsSnap.forEach(doc => {
          users.push(doc.data());
        });
        this.all_users = users;
        resolve();
      });
    });
  }

  /**
   * Loads the current authenticated user into the `currentUserSubject` observable. 
   * This helps other parts of the application to know the state of the currently logged-in user.
   * @returns {Promise<void>} Resolves when the authentication state has been determined.
   */
  loadCurrentUser() {
    this.userLoaded = new Promise<void>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUserSubject.next(user);
        resolve();
      });
    });
  }

  /**
   * Waits until the authentication state (user logged in/out) is initialized.
   * Useful for parts of the application that require the user's authentication status.
   * @returns {Promise<void>} Resolves when the authentication state has been initialized.
   */
  // async waitUntilAuthInitialized(): Promise<void> {
  //   return this.authInitializedPromise;
  // }

  /**
   * Retrieves the UID (unique identifier) of the currently authenticated user.
   * @returns {string} The UID of the authenticated user.
   */
  getUid() {
    const user = this.auth.currentUser;
    return user.uid;
  }

  /**
   * Fetches user data from the Firestore database given a UID.
   * @param {string} uid - The UID of the user whose data needs to be fetched.
   */
  async getUserData(uid: string) {
    const userRef = doc(this.db, "users", uid);
    let docSnap = await getDoc(userRef);
    this.userData = docSnap.data();
    console.log(this.userData);
  }

  /**
   * Signs up a user with a provided email and password. 
   * If the sign-up is successful, the user data is set. 
   * Error handling is done for scenarios like if the email is already in use.
   * @param {string} email - The email address of the user.
   * @param {string} password - The desired password for the user.
   */
  async SignUp(email: string, password: string) {
    try {
      await this.afAuth
        .createUserWithEmailAndPassword(email, password).then((result) => {
          this.SetUserData(result.user);
        });
      this.signUp_successful = true;
      setTimeout(() => this.signUp_successful = false, 3000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        this.email_error = true;
        setTimeout(() => this.email_error = false, 3000);
      } else
        window.alert(error.message);
    }
  }

  /**
   * Handles the sign-in process using provided email and password.
   * On successful sign-in, sets the online status of the user.
   * @param {string} email - The email address of the user.
   * @param {string} password - The password for the user.
   */
  async SignIn(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.signIn_successful = true;
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      this.signIn_error = true;
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }

  /**
   * Handles the sign-in process for a guest user.
   */
  async guestSignIn() {
    try {
      await this.afAuth.signInWithEmailAndPassword('gast@gast.de', 'Amidala6%');
      this.signIn_successful = true;
      setTimeout(() => this.signIn_successful = false, 3000);
      this.channelService.loadDefaultChannel();
    } catch (error) {
      this.signIn_error = true;
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }

  /**
   * Updates the online status of a user in the Firestore database.
   * @param {string} email - The email address of the user.
   * @param {string} status - The new status to set.
   */
  async setOnlineStatus(email: string, status: string) {
    console.log(this.all_users);
    const user = await this.all_users.find(element => element.email === email);
    const userRef = doc(this.db, 'users', user.uid);
    await updateDoc(userRef, {
      status: status
    });
    console.log('online status' + status + this.userData.email);
  }




  /**
   * Initiates the Google authentication process.
   */
  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider());
  }

  /**
   * Handles the sign-in process using a provided authentication provider.
   * Used for third-party authentication methods like Google.
   * @param {firebase.auth.AuthProvider | GoogleAuthProvider} provider - The authentication provider to use.
   */
  async AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
    try {
      const result = await this.afAuth.signInWithPopup(provider);
      this.userName = result.user.displayName;
      await this.isEmailRegistered(result.user.email, result.user);
      this.signIn_successful = true;
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      window.alert(error.message);
    }
  }

  /**
   * Checks if an email address is already registered.
   * Sets online status and loads standard channels if the user is registered.
   * @param {string} email - The email address to check.
   * @param {firebase.User} user - The user object containing user details.
   */
  async isEmailRegistered(email: string, user: firebase.User) {
    (await this.getAllUsers()).forEach(element => {
      if (element.email == email) {
        this.googleUser_exist = true;
        this.channelService.loadDefaultChannel();
        return;
      }
    });
    if (this.googleUser_exist != true) await this.SetUserData(user);
  }

  /**
   * Sends a password reset email to the provided email address.
   * @param {string} passwordResetEmail - The email address to which the password reset link should be sent.
   */
  async ForgotPassword(passwordResetEmail: string) {
    await this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.email_send = true;
        setTimeout(() => this.email_send = null, 3000);
      })
      .catch((error) => {
        this.email_send = false;
        setTimeout(() => this.email_send = null, 3000);
      });
  }

  /**
   * Sets the user data in Firestore.
   * @param {any} user - The user object containing user details.
   */
  async SetUserData(user: any) {
    await this.channelService.addUserToChannel('Entwicklerteam', user.uid);
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userDataFirestore = {
      uid: user.uid,
      email: user.email,
      user_name: this.userName,
      avatar: 'assets/img/big_avatar/81. Profile.png',
      status: 'Aktiv'
    };
    await userRef.set(userDataFirestore, {
      merge: true,
    });
    this.getUserData(user.uid);
  }

  /**
   * Handles the user sign-out process.
   */
  async signOut() {
    await this.setOnlineStatus(this.userData.email, 'Abwesend');
    await this.afAuth.signOut();
    this.router.navigateByUrl('/sign-in');
  }

  /**
   * Fetches all users from the Firestore 'users' collection.
   * @returns {Promise<any[]>} An array of user objects.
   */
  async getAllUsers() {
    const usersSnapshot = await getDocs(collection(this.db, 'users'));
    let users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }

  /**
   * Retrieves user information based on UID.
   * @param {string} uid - The unique identifier of the user.
   * @returns {any} User information object.
   */
  getUserInfo(uid: string) {
    const user = this.all_users.find(user => user.uid === uid);
    return user;
  }

  /**
   * Filters and returns a list of users based on the provided name string.
   * @param {string} name - The name string to filter users by.
   * @returns {Promise<any[]>} An array of user objects.
   */
  async filterUsers(name: string): Promise<any[]> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUser;
  };

  /**
   * Filters and returns a list of users based on the provided email string.
   * @param {string} email - The email string to filter users by.
   * @returns {Promise<any>} An array of user objects.
   */
  async filterUsersByEmail(email: string): Promise<any> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.email?.toLowerCase().startsWith(email?.toLowerCase())
    );
    return filteredUser;
  };

  /**
   * Returns a list of all users except the current user.
   * @returns {Promise<any[]>} An array of user objects.
   */
  async usersWithoutCurrentuser() {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(user => user.user_name === this.userData.user_name);
    if (userIndex !== -1) users.splice(userIndex, 1);
    return users;
  }

  /**
   * Updates the user's name and email in the Firestore database.
   * @param {string} userName - The new name of the user.
   * @param {string} email - The new email of the user.
   */
  async updateUserDetails(userName: string, email: string) {
    const user = this.auth.currentUser;
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

  /**
   * Updates the avatar image for the current user in the Firestore database.
   * @param {string} image - The new avatar image URL.
   */
  async setAvatarImage(image: string) {
    const docRef = doc(this.db, "users", this.getUid());
    await updateDoc(docRef, {
      avatar: image
    });
    this.getUserData(this.getUid());
  }

  /**
   * Retrieves the avatar image URL for a user based on their UID.
   * @param {string} uid - The unique identifier of the user.
   * @returns {string} Avatar image URL.
   */
  getImageUrl(uid: string) {
    const user = this.all_users.find(element => element.uid === uid);
    if (user) return user.avatar;
  }

  /**
   * Checks if a user is the current authenticated user.
   * @param {any} user - The user object to check.
   * @returns {boolean} `true` if the user is the current user, `false` otherwise.
   */
  isCurrentUser(user): boolean {
    return user === this.userData.uid ? true : false;
  }
}
