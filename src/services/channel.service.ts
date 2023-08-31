import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  db = getFirestore();
  public authorizedChannelsSubject = new BehaviorSubject<any[]>([]);
  authorizedChannels = this.authorizedChannelsSubject.asObservable();
  userIdSubject = new BehaviorSubject<string | undefined>(undefined);
  currentUserId = this.userIdSubject.asObservable();
  private avatarSelectedSource = new Subject<string>();
  userAvatar$ = this.avatarSelectedSource.asObservable();
  private userSelectedSource = new Subject<string>();
  userSelected$ = this.userSelectedSource.asObservable();
  private showSelectedUserDiv = new BehaviorSubject<boolean>(false);
  showSelectedUser$ = this.showSelectedUserDiv.asObservable();
  showAutoComplete = new BehaviorSubject<boolean>(true);
  showAutoComplete$ = this.showAutoComplete.asObservable();
  currentChannelID: string = 'noChannelSelected';
  channels: any[] = [];
   auth = getAuth();
  private createtChannelId  = new BehaviorSubject<string>(undefined);
  createtChannelId$ : Observable<string> = this.createtChannelId .asObservable();
  
  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
  ) { 


    const dbRef = collection(this.db, "channels");
    onSnapshot(dbRef, docsSnap => {
      const channels: any[] = []
      docsSnap.forEach(doc => {
        channels.push(doc.data())
      })
      this.channels = channels
    });
  }


  setCreatetChannelId(newValue: string) {
    this.createtChannelId.next(newValue);
  }
  

  showSelectedUser(value: boolean) {
    this.showSelectedUserDiv.next(value);
  }

  getUserId(uid: string) {
    this.userIdSubject.next(uid);
  }

  selectUser(userName: string) {
    this.userSelectedSource.next(userName);
  }

  selectAvatar(avatarUrl: string) {
    this.avatarSelectedSource.next(avatarUrl);
  }

  toggleAutocomplete(value: boolean) {
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

  async createNewChannel(channel: string, description?: string) {
    
    const user = this.auth.currentUser;

    if (user !== null) {
      try {
        const channelCollectionRef = await addDoc(collection(this.db, 'channels'),{
          channelName: channel,
          createdBy: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          assignedUsers: [user.uid,],
          description: description
        });
        const newChannelID = channelCollectionRef.id;
        await updateDoc(channelCollectionRef, {
          channel_ID: newChannelID
        });
        this.getAuthorizedChannels(user.uid);
        this.setCreatetChannelId(channelCollectionRef.id)
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
      channels.push(doc.data());
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

  async addUserToChannel(channelName: string, id:string) {
    const channelSnapshot = await getDocs(query(collection(this.db, 'channels'), where('channelName', '==', channelName)));
    if (!channelSnapshot.empty) {
      const channelDoc = channelSnapshot.docs[0];
      await updateDoc(channelDoc.ref, {
        assignedUsers: arrayUnion(id)
      });
    } else {
      console.error(`Kein Channel gefunden mit dem Namen: ${channelName}`);
    }
  }

  async updateChannelInfo(currentChatData, changes){
    const auth = getAuth();
    const user = auth.currentUser; 
      try {
        const channelDocRef = doc(this.db, 'channels', currentChatData.channel_ID);
        await updateDoc(channelDocRef, changes);
        this.getAuthorizedChannels(user.uid);
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Channels: ", error);
      }
  }


  async deleteChannel(id:string) {
    const documentRef = doc(this.db, 'channels', id);
    await deleteDoc(documentRef)
    this.loadStandardChannel()
  }
  

  loadStandardChannel() {
    this.setCreatetChannelId('RRraQrPndWV95cqAWCZR')
  }
}
