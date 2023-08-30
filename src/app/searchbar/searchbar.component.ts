import { Component, ElementRef } from '@angular/core';
import { getFirestore, collection, getDocs } from '@angular/fire/firestore';
import { HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
  db = getFirestore();
  showResults = false;
  isLoading = false;
  searchValue = '';

  usersSet: Set<any> = new Set();
  channelsSet: Set<any> = new Set();
  filteredChannelMessagesSet: Set<any> = new Set();

  filteredUsers: Array<any> = [];
  filteredChannels: Array<any> = [];
  filteredChannelMessages: Array<any> = [];

  profileRef;
  profileRefOpen = false;

  constructor(private elementRef: ElementRef, private dialog: MatDialog,
    public chatService: ChatService, public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService) { }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const inputElement = this.elementRef.nativeElement.querySelector('.input-container input');
    const searchContainer = this.elementRef.nativeElement.querySelector('.search-container');

    if (inputElement.contains(event.target) || searchContainer && searchContainer.contains(event.target)) {
      return;
    }
    this.showResults = false;
  }

  @HostListener(':click', ['$event'])
  handleClickInside(event: Event) {
    const resultRows = this.elementRef.nativeElement.querySelectorAll('.result-row span');

    for (let span of resultRows) {
      if (span.contains(event.target)) {
        this.searchValue = span.textContent;
        event.stopPropagation();
        this.onSearchValueChange()
        return;
      }
    }
  }

  async onSearchValueChange() {
    if (this.searchValue.length == 0) this.showResults = false;
    else {

      this.isLoading = true;
      this.showResults = true;

      this.usersSet.clear();
      this.channelsSet.clear();
      this.filteredChannelMessagesSet.clear();
      this.filteredChannels = [];
      this.filteredUsers = [];
      this.filteredChannelMessages = [];

      await this.search('channels');
      await this.search('users');
      await this.searchMessagesInChannels();

      this.filteredChannels = Array.from(this.channelsSet).filter(channel =>
        channel.channelName.toLowerCase().startsWith(this.searchValue)
      );
      this.filteredUsers = Array.from(this.usersSet).filter(user =>
        user.user_name.toLowerCase().startsWith(this.searchValue.toLowerCase())
      );

      this.filteredChannelMessages.filter(msg =>
        msg.combinedMessage.toLowerCase().startsWith(this.searchValue.toLowerCase())
      );

      this.isLoading = false;
      this.show();
    }
  }

  async search(collectionName: string) {
    const collectionRef = collection(this.db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    querySnapshot.forEach((doc) => {
      if (collectionName === 'channels') this.channelsSet.add(doc.data());
      if (collectionName === 'users') this.usersSet.add(doc.data());
    });
  }

  async searchMessagesInChannels() {
    const channelsRef = collection(this.db, 'channels');
    const channelsSnapshot = await getDocs(channelsRef);
    const uniqueMessageMap = new Map();

    for (let channelDoc of channelsSnapshot.docs) {
      const channelName = channelDoc.data().channelName;
      const messagesRef = collection(channelDoc.ref, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);

      messagesSnapshot.docs.forEach(messageDoc => {
        const message = messageDoc.data().chat_message;
        const messageSender = messageDoc.data().user_Sender_Name;

        if (message.toLowerCase().startsWith(this.searchValue.toLowerCase())) {
          const combinedMessage = `"${message}" in #${channelName} von: ${messageSender}`;
          const channel_ID = channelDoc.data().channel_ID;
          const uniqueKey = combinedMessage + "|" + channel_ID;

          if (!uniqueMessageMap.has(uniqueKey)) {
            uniqueMessageMap.set(uniqueKey, { combinedMessage: combinedMessage, channel_ID: channel_ID });
          }
        }
      });
    }

    this.filteredChannelMessages = [...uniqueMessageMap.values()];
  }


  show() {
    if (this.searchValue.length > 0 && this.filteredChannels.length > 0 ||
      this.searchValue.length > 0 && this.filteredUsers.length > 0 ||
      this.searchValue.length > 0 && this.filteredChannelMessages.length > 0) {
      this.showResults = true;
    } else this.showResults = false;
  }

  openProfile(user) {
    this.searchValue = '';
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'add-channel-dialog';
    dialogConfig.data = dialogConfig.data = { 
      user: {
        user_name: user.user_name, 
        email: user.email,  
        status: user.status,
        uid: user.uid
      }
    };

    this.dialog.closeAll();

    this.profileRef = this.dialog.open(DialogProfileComponent, dialogConfig);
    this.profileRefOpen = true;

    this.profileRef.afterClosed().subscribe(() => {
      this.profileRefOpen = false;
    });
  }

  openChannel(channelID) {
    this.searchValue = '';
    if (this.chatService.currentChatID !== channelID) {
      this.chatService.currentChatSection = 'channels';
      this.chatService.currentChatID = channelID;
      try {
        this.chatService.getCurrentChatData();
        this.chatService.textAreaMessageTo();
        this.msgService.getMessages();
        this.fsDataThreadService.thread_open = false;
      } catch (error) {
        console.error("Fehler bei öffnen des Channels: ", error);
      }
    }
  }

  openMsg(channelID) {
    this.openChannel(channelID);
  }
}

