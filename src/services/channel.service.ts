import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  db = getFirestore();
  public authorizedChannelsSubject = new BehaviorSubject<any[]>([]);
  authorizedChannels = this.authorizedChannelsSubject.asObservable();
  userIdSubject = new BehaviorSubject<string | undefined>(undefined);
  currentUserId = this.userIdSubject.asObservable();
  private userSelectedSource = new Subject<string>();
  userSelected$ = this.userSelectedSource.asObservable();
  private showSelectedUserDiv = new BehaviorSubject<boolean>(false);
  showSelectedUser$ = this.showSelectedUserDiv.asObservable();
  showAutoComplete = new BehaviorSubject<boolean>(true);
  showAutoComplete$ = this.showAutoComplete.asObservable();


  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
  ) { }

  showSelectedUser(value: boolean) {
    this.showSelectedUserDiv.next(value);
  }

  getUserId(uid:string) {
    this.userIdSubject.next(uid);
  }

  selectUser(userName: string) {
    this.userSelectedSource.next(userName);
  }

  toggleAutocomplete(value:boolean) {
    this.showAutoComplete.next(value);
  }

  async getAllMembersOfCertainChannel(channelName: string): Promise<string[]> {
      const channelRef = doc(this.db, 'channels', channelName);
      const channelSnapshot = await getDoc(channelRef);
  
      if (channelSnapshot.exists()) {
          const channelData = channelSnapshot.data();
          const assignedUsers = channelData?.assignedUsers || [];
          return assignedUsers;
      } else {
          console.log(`Channel with name ${channelName} does not exist.`);
          return [];
      }
  }

  async createNewChannel(channel: string, description?: string){
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
      try {
        const channelCollectionRef = collection(this.db, 'channels');
        const newChannel = {
          channelName: channel,
          createdBy: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          assignedUsers: [
            user.uid,
          ],
          description: description
        };
        const docRef = await addDoc(channelCollectionRef, newChannel);
        this.getAuthorizedChannels(user.uid);
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Channels: ", error);
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }

  async getAuthorizedChannels(uid: string) {
    const allDocuments = query(collection(this.db, 'channels'), where('assignedUsers', 'array-contains', uid));

    const querySnapshot = await getDocs(allDocuments);
    const channels: any[] = [];
    querySnapshot.forEach((doc) => {
      channels.push(doc.data().channelName);
    });
    this.authorizedChannelsSubject.next(channels);
  }


  async getChannels(uid: string) {
    const allDocuments = query(collection(this.db, 'channels'), where('assignedUsers', 'array-contains', uid));

    const querySnapshot = await getDocs(allDocuments);
    const channels: any[] = [];
    querySnapshot.forEach((doc) => {
      channels.push(doc.data());
    });
    return channels;
  }

  async findUserByName(name: string): Promise<string | null> {
    const usersSnapshot = await getDocs(query(collection(this.db, 'users'), where('user_name', '==', name)));

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      console.log(userDoc);
      return userDoc.data().uid;
    }

    return null;
  }

  async addUserToChannel(channelName: string, uid: string) {
    const channelSnapshot = await getDocs(query(collection(this.db, 'channels'), where('channelName', '==', channelName)));

    if (!channelSnapshot.empty) {
      const channelDoc = channelSnapshot.docs[0];
      await updateDoc(channelDoc.ref, {
        assignedUsers: arrayUnion(uid)
      });
    } else {
      console.error(`Kein Channel gefunden mit dem Namen: ${channelName}`);
    }
  }
}
