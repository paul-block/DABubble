import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GeneralFunctionsService } from './general-functions.service';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  db = getFirestore();
  auth = getAuth();

  public authorizedChannelsSubject = new BehaviorSubject<any[]>([]);
  authorizedChannels = this.authorizedChannelsSubject.asObservable();

  private createdChannelId  = new BehaviorSubject<string>(undefined);
  createdChannelId$ : Observable<string> = this.createdChannelId .asObservable();

  currentChannelID: string = 'noChannelSelected';
  currentChannelData:any;
  channels: any[] = [];


  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public generalFuncttions: GeneralFunctionsService,
  ) { 
    const dbRef = collection(this.db, "channels");
    onSnapshot(dbRef, docsSnap => {
      const channels: any[] = []
      docsSnap.forEach(doc => {
        channels.push(doc.data())
      })
      this.channels = channels;
      this.loadCurrentChannel()
      const user = this.auth.currentUser;
      if (user !== null) {
         this.getAuthorizedChannels(user.uid);
      }
    });
  }


  setCreatedChannelId(newValue: string) {
    this.createdChannelId.next(newValue);
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
        this.setCreatedChannelId(channelCollectionRef.id)
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
    this.channels = channels;
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


  async deleteChannel(channelId: string) {
    const subcollectionRef = collection(this.db, 'channels', channelId, 'messages'); 
    const subcollectionQuery = query(subcollectionRef);
    const subcollectionDocs = await getDocs(subcollectionQuery);
    const deleteSubcollectionPromises = subcollectionDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteSubcollectionPromises);
    const documentRef = doc(this.db, 'channels', channelId);
    await deleteDoc(documentRef);
    this.loadStandardChannel();
  }


  loadStandardChannel() {
    this.setCreatedChannelId('RRraQrPndWV95cqAWCZR');
  }


  loadCurrentChannel() {
    let channel = this.channels.find(element => element.channel_ID === this.currentChannelID)
    if(channel) this.currentChannelData = channel
  }
}
