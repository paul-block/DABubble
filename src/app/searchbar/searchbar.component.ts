import { Component, ElementRef } from '@angular/core';
import { collection, getDocs } from '@angular/fire/firestore';
import { HostListener } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { ChannelService } from 'services/channel.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { AuthenticationService } from 'services/authentication.service';
import { OpenChatService } from 'services/open-chat.service';
import { ProfileService } from 'services/profile.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
  db = this.authService.db;
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

  constructor(
    private elementRef: ElementRef,
    public chatService: ChatService, 
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public channelService: ChannelService,
    public authService: AuthenticationService,
    public openChatService: OpenChatService,
    public profileService: ProfileService) { }

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
      this.clear();
      await this.getData('channels', this.authService.userData.uid);
      await this.getData('users', this.authService.userData.uid);
      await this.getChannelMessages(this.authService.userData.uid);
      this.filterResults();
      this.isLoading = false;
      this.show();
    }
  }

  filterResults() {
    this.filteredChannels = Array.from(this.channelsSet).filter(channel =>
      channel.channelName.toLowerCase().startsWith(this.searchValue)
      );
    this.filteredUsers = Array.from(this.usersSet).filter(user =>
      user.user_name.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
    this.filteredChannelMessages.filter(msg =>
      msg.combinedMessage.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
  }

  async getData(collectionName: string, currentUserId: string) {
    const collectionRef = collection(this.db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    querySnapshot.forEach((doc) => {
      if (collectionName === 'channels') {
        const channelData = doc.data();
        if (channelData.assignedUsers?.includes(currentUserId)) {
          this.channelsSet.add(channelData);
        }
      }
      if (collectionName === 'users') this.usersSet.add(doc.data());
    });
  }
  
async getChannelMessages(currentUserId: string) {
  const channelsRef = collection(this.db, 'channels');
  const channelsSnapshot = await getDocs(channelsRef);
  const uniqueMessageMap = new Map();
  await this.checkChannelMessages(channelsSnapshot, currentUserId, uniqueMessageMap)
  this.filteredChannelMessages = [...uniqueMessageMap.values()];
}

async checkChannelMessages(channelsSnapshot, currentUserId, uniqueMessageMap) {
  for (let channelDoc of channelsSnapshot.docs) {
    const channelData = channelDoc.data();
    if (!channelData.assignedUsers?.includes(currentUserId)) continue;
    const channelName = channelData.channelName;
    const messagesRef = collection(channelDoc.ref, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    for (let messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        const message = messageData.chat_message;
        const messageSender = messageData.user_Sender_Name;
        if (!message) continue;
        if (this.checkMessageRelevant(message)) 
        this.createCombinedMessage(message, channelName, messageSender, channelData, uniqueMessageMap)
    }
}
}

checkMessageRelevant(message) {
 return message.toLowerCase().startsWith(this.searchValue.toLowerCase())
}

createCombinedMessage(message, channelName, messageSender, channelData, uniqueMessageMap) {
  const combinedMessage = `"${message}" in #${channelName} von: ${messageSender}`;
  const channel_ID = channelData.channel_ID;
  const uniqueKey = combinedMessage + "|" + channel_ID;
  if (!uniqueMessageMap.has(uniqueKey)) {
    uniqueMessageMap.set(uniqueKey, { combinedMessage: combinedMessage, channel_ID: channel_ID });
}
}

  show() {
    if (this.searchValue.length > 0 && this.filteredChannels.length > 0 ||
      this.searchValue.length > 0 && this.filteredUsers.length > 0 ||
      this.searchValue.length > 0 && this.filteredChannelMessages.length > 0) {
      this.showResults = true;
    } else this.showResults = false;
  }

  clear() {
    this.usersSet.clear();
    this.channelsSet.clear();
    this.filteredChannelMessagesSet.clear();
    this.filteredChannels = [];
    this.filteredUsers = [];
    this.filteredChannelMessages = [];
  }

  openProfile(user) {
    this.searchValue = '';
    this.profileService.openProfile(user.uid)
  }

  openChannel(channelID: string) {
    this.searchValue = '';
    this.openChatService.openChat(channelID, 'channels');
  }

  openMsg(channelID) {
    this.openChannel(channelID);
  }

}

