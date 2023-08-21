import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { getAuth } from '@firebase/auth';
import { addDoc, collection, doc, getDocs, getDoc, query, where, updateDoc } from '@firebase/firestore';
import { AuthenticationService } from './authentication.service';
import firebase from 'firebase/compat/app';


@Injectable({
  providedIn: 'root'
})

export class NewMsgService {
  private _openNewMsg = new BehaviorSubject<boolean>(false);
  public readonly openNewMsg$ = this._openNewMsg.asObservable();

  db = this.authService.db;
  user_name: string;
  user_id: string;
  directedFromProfileButton:boolean = false;

  constructor(private authService: AuthenticationService) { }

  toggleNewMsg() {
    this._openNewMsg.next(!this._openNewMsg.getValue());
  }

  openNewMsgComponent() {
   // funktion die immer öffnet, nicht toggled 
  }

  async addOrUpdateChat(messageText: string, channelOrUserInput: string) {
    const auth = getAuth();
    const currentUserUID = auth.currentUser.uid;

    const userRef = doc(this.db, 'users', currentUserUID);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists) {
      console.error('Der aktuelle Benutzer wurde nicht in der Datenbank gefunden.');
      return;
    }

    const userName = userDoc.data().user_name; // Extrahieren des Benutzernamens

  
    if (channelOrUserInput.startsWith('#') || channelOrUserInput.includes('#')) {
      // Hier behandeln wir die Channel-Logik

      const channelName = channelOrUserInput.substring(1); // Entfernen Sie das "An: #"
      console.log(channelName);
      // Channel in Ihrer Datenbank finden
      const channelsCollection = collection(this.db, 'channels');
      const channelQuery = query(channelsCollection, where('channelName', '==', channelName));
      const channelSnapshot = await getDocs(channelQuery);
  
      let channelDocRef;
      channelSnapshot.forEach(doc => {
        const channelData = doc.data();
        if (channelData.assignedUsers.includes(currentUserUID)) {
          channelDocRef = doc.ref;
        }
      });
  
      if (channelDocRef) {
        // User ist in der assignedUsers-Liste des Channels
        const channelMessagesCollectionRef = collection(channelDocRef, 'channel_messages');
        await addDoc(channelMessagesCollectionRef, {
          message: messageText,
          user_id: currentUserUID,
          // Hier setzen Sie den Benutzernamen, es sei denn, Sie haben ihn irgendwo verfügbar.
          user_name: userName,
          // Sie müssen dies durch den tatsächlichen Benutzernamen ersetzen
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Nachricht zum Channel hinzugefügt');
      } else {
        console.error('Benutzer nicht für den Channel autorisiert oder Channel nicht gefunden');
      }
  
    } else if (channelOrUserInput.startsWith('@') || channelOrUserInput.includes('@')) {
 // Es handelt sich um einen Benutzer
      const receiverUID = this.user_id;

      // Überprüfen, ob ein Chat-Dokument mit den beiden User-IDs bereits existiert
      const chatCollection = collection(this.db, 'chats');
      const chatQuery = query(chatCollection, where('chat_Member_IDs', 'array-contains', currentUserUID));
      const chatSnapshot = await getDocs(chatQuery);

      let chatDocExists = false;
      let chatDocRef;

      chatSnapshot.forEach(doc => {
        const chatData = doc.data();
        if (chatData.chat_Member_IDs.includes(receiverUID)) {
          chatDocExists = true;
          chatDocRef = doc;
        }
      });

      // Dokument aktualisieren oder erstellen
      if (chatDocExists && chatDocRef) {
        // Chat-Dokument gefunden, fügen Sie die neue Nachricht hinzu
        const messagesCollectionRef = collection(chatDocRef.ref, 'messages');
        await addDoc(messagesCollectionRef, {
          chat_message: messageText,
          user_Sender_ID: currentUserUID,
          user_name: userName,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log('chat dokument gefunden, fügt neues dokument in die vorhandenen messages');
      } else {
        // Kein Chat-Dokument gefunden, neues erstellen
        const newChatRef = await addDoc(chatCollection, {
          chat_Member_IDs: [currentUserUID, receiverUID],
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });
              
        console.log('kein chat gefunden, erstelle neuen');

        const newMessagesCollectionRef = collection(newChatRef, 'messages');
        await addDoc(newMessagesCollectionRef, {
          chat_message: messageText,
          user_Sender_ID: currentUserUID,
          user_name: userName,
          created_At: firebase.firestore.FieldValue.serverTimestamp(),
        });
              
        console.log('neue nachricht in neuen chat hinzugefügt');
      }
  
    } else {
      console.error('Ungültiger Eingabewert. Es sollte mit # oder @ beginnen.');
    }
  }


//   async addOrUpdateChat(messageText: string, channelOrUserInput: string) {
//     const auth = getAuth();
//     const currentUserUID = auth.currentUser.uid;
  
//     if (channelOrUserInput.startsWith('An: #')) {
//       // Hier behandeln wir die Channel-Logik
//       const channelName = channelOrUserInput.substring(4); // Entfernen Sie das "#"
//       // Verwenden Sie channelName, um den richtigen Channel in Ihrer Datenbank zu finden und Nachrichten hinzuzufügen/aktualisieren.
//       // Hinweis: Sie müssen den Code hier vervollständigen, um die Nachricht zum richtigen Kanal hinzuzufügen.
  
//     } else if (channelOrUserInput.startsWith('An: @') || channelOrUserInput.includes('@')) {
//       // Es handelt sich um einen Benutzer
//       const receiverUID = this.user_id;

//       // Überprüfen, ob ein Chat-Dokument mit den beiden User-IDs bereits existiert
//       const chatCollection = collection(this.db, 'chats');
//       const chatQuery = query(chatCollection, where('chat_Member_IDs', 'array-contains', currentUserUID));
//       const chatSnapshot = await getDocs(chatQuery);

//       let chatDocExists = false;
//       let chatDocRef;

//       chatSnapshot.forEach(doc => {
//         const chatData = doc.data();
//         if (chatData.chat_Member_IDs.includes(receiverUID)) {
//           chatDocExists = true;
//           chatDocRef = doc;
//         }
//       });

//       // Dokument aktualisieren oder erstellen
//       if (chatDocExists && chatDocRef) {
//         // Chat-Dokument gefunden, fügen Sie die neue Nachricht hinzu
//         const messagesCollectionRef = collection(chatDocRef.ref, 'messages');
//         await addDoc(messagesCollectionRef, {
//           chat_message: messageText,
//           user_Sender_ID: currentUserUID,
//           created_At: firebase.firestore.FieldValue.serverTimestamp(),
//         });
//         console.log('chat dokument gefunden, fügt neues dokument in die vorhandenen messages');
//       } else {
//         // Kein Chat-Dokument gefunden, neues erstellen
//         const newChatRef = await addDoc(chatCollection, {
//           chat_Member_IDs: [currentUserUID, receiverUID],
//           created_At: firebase.firestore.FieldValue.serverTimestamp(),
//         });
              
//         console.log('kein chat gefunden, erstelle neuen');

//         const newMessagesCollectionRef = collection(newChatRef, 'messages');
//         await addDoc(newMessagesCollectionRef, {
//           chat_message: messageText,
//           user_Sender_ID: currentUserUID,
//           created_At: firebase.firestore.FieldValue.serverTimestamp(),
//         });
              
//         console.log('neue nachricht in neuen chat hinzugefügt');
//       }
  
//     } else {
//       console.error('Ungültiger Eingabewert. Es sollte mit # oder @ beginnen.');
//     }
// }


  // async addOrUpdateChat(messageText: string) {
  //   const auth = getAuth();
  //   const currentUserUID = auth.currentUser.uid;
  //   const receiverUID = this.user_id;

  //   // 1. Überprüfen, ob ein Chat-Dokument mit den beiden User-IDs bereits existiert
  //   const chatCollection = collection(this.db, 'chats');
  //   const chatQuery = query(chatCollection, where('chat_Member_IDs', 'array-contains', currentUserUID));
  //   const chatSnapshot = await getDocs(chatQuery);

  //   let chatDocExists = false;
  //   let chatDocRef;

  //   chatSnapshot.forEach(doc => {
  //     const chatData = doc.data();
  //     if (chatData.chat_Member_IDs.includes(receiverUID)) {
  //       chatDocExists = true;
  //       chatDocRef = doc;
  //     }
  //   });

  //   // 2. Dokument aktualisieren oder erstellen
  //   if (chatDocExists && chatDocRef) {
  //     // Chat-Dokument gefunden, fügen Sie die neue Nachricht hinzu (je nach Ihrer Datenstruktur)
  //     const messagesCollectionRef = collection(chatDocRef.ref, 'messages');
  //     await addDoc(messagesCollectionRef, {
  //       chat_message: messageText,
  //       user_Sender_ID: currentUserUID,
  //       created_At: firebase.firestore.FieldValue.serverTimestamp(),
  //       });
  //     console.log('chat dokument gefunden, fügt neues dokument in die vorhandenen messages');
  //   } else {
  //     // Kein Chat-Dokument gefunden, neues erstellen
  //     const newChatRef = await addDoc(chatCollection, {
  //       chat_Member_IDs: [currentUserUID, receiverUID],
  //       created_At: firebase.firestore.FieldValue.serverTimestamp(),
  //     });
            
  //     console.log('kein chat gefunden, erstelle neuen')

  //     const newMessagesCollectionRef = collection(newChatRef, 'messages');
  //     await addDoc(newMessagesCollectionRef, {
  //       chat_message: messageText,
  //       user_Sender_ID: currentUserUID,
  //       created_At: firebase.firestore.FieldValue.serverTimestamp(),
  //     });
            
  //     console.log('neue nachricht in neuen chat hinzugefügt')
  //   }
  // }
}

