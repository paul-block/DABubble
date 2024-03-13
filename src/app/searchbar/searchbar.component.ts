import { Component, ElementRef } from '@angular/core';
import { collection, getDocs } from '@angular/fire/firestore';
import { HostListener } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { ChannelService } from 'services/channel.service';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';
import { OpenChatService } from 'services/open-chat.service';
import { ProfileService } from 'services/profile.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
  showResults: boolean = false;
  noResults: boolean = false;
  isLoading: boolean = false;
  searchValue: string = '';
  channelList: Array<any> = [];
  userList: Array<any> = [];
  channelMessages: Array<any> = [];
  filteredUsers: Array<any> = [];
  filteredChannels: Array<any> = [];
  filteredChannelMessages: Array<any> = [];

  constructor(
    private elementRef: ElementRef,
    public chatService: ChatService,
    public msgService: MessagesService,
    public channelService: ChannelService,
    public authService: AuthenticationService,
    public openChatService: OpenChatService,
    public profileService: ProfileService) { }

  /**
  * Listens for click events outside the component and hides the search results if clicked outside specific elements.
  * @param {Event} event - The triggered DOM event.
  */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const inputElement = this.elementRef.nativeElement.querySelector('.input-container');
    if (inputElement.contains(event.target)) return;
    this.showResults = false;
  }

  /**
  * Listens for click events inside the component and handles the search value selection.
  * @param {Event} event - The triggered DOM event.
  */
  @HostListener(':click', ['$event'])
  handleClickInside(event: Event) {
    const resultRows = this.elementRef.nativeElement.querySelectorAll('.result-row');
    for (let span of resultRows) {
      if (span.contains(event.target)) {
        this.searchValue = span.textContent;
        this.onSearchValueChange();
        return;
      }
    }
  }

  /**
  * Handles the search value changes,
  * clears previous data, retrieves the new data, and filters the results.
  */
  async onSearchValueChange() {
    if (this.searchValue.length !== 0) {
      this.isLoading = true;
      this.showResults = true;
      this.clear();
      await this.getData('channels', this.authService.userData.uid);
      await this.getData('users', this.authService.userData.uid);
      await this.getMessages(this.authService.userData.uid);
      this.filterResults();
      this.isLoading = false;
      this.show();
    }
    else this.showResults = false;
  }

  /**
  * Filters the results from the fetched data based on the current search value.
  */
  filterResults() {
    this.filteredChannels = this.channelList.filter(channel =>
      channel.channelName.toLowerCase().startsWith(this.searchValue)
    );
    this.filteredUsers = this.userList.filter(user =>
      user.user_name.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
    this.filteredChannelMessages = this.channelMessages.filter(msg =>
      msg.combinedMessage.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
  }

  /**
  * Fetches data based on the current user's ID and updates the local data sets.
  * @param {string} collectionName - Name of the Firestore collection.
  * @param {string} currentUserId - UID of the current user.
  */
  async getData(collectionName: string, currentUserId: string) {
    const collectionRef = collection(this.authService.db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    querySnapshot.forEach((doc) => {
      if (collectionName === 'channels') {
        const channelData = doc.data();
        if (channelData.assignedUsers?.includes(currentUserId)) this.channelList.push(channelData);
      }
      if (collectionName === 'users') this.userList.push(doc.data());
    });
  }

  /**
  * Fetches all channel messages that current user is authorized to see.
  * @param {string} currentUserId - UID of the current user.
  */
  async getMessages(currentUserId) {
    const channelsRef = collection(this.authService.db, 'channels');
    const AllChannelDocs = await getDocs(channelsRef);
    for (let channelDoc of AllChannelDocs.docs) {
      const channelData = channelDoc.data();
      if (channelData.assignedUsers?.includes(currentUserId)) {
        const channelName = channelData.channelName;
        const messagesRef = collection(channelDoc.ref, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        for (let messageDoc of messagesSnapshot.docs) {
          const messageData = messageDoc.data();
          const message = messageData.chat_message;
          const messageSender = messageData.user_Sender_Name;
          if (this.checkMessageRelevant(message)) {
            if (this.channelMessages.some(msg => msg.combinedMessage === `${message} in #${channelName} von: ${messageSender}`)) return;
            else this.channelMessages.push(this.combinedMsgData(message, channelName, messageSender, channelData.channel_ID));
          }
        }
      }
    }
  }

  /**
   * Returns an object containing a combined message and channel ID.
   * @param {string} message - The message text.
   * @param {string} channelName - The name of the channel.
   * @param {string} messageSender - The sender of the message.
   * @param {string} channel_ID - The ID of the channel.
   * @returns {Object} - An object with combinedMessage and channel_ID properties.
   */
  combinedMsgData(message: string, channelName: string, messageSender: string, channel_ID: string) {
    return {
      combinedMessage: `${message} in #${channelName} von: ${messageSender}`,
      channel_ID: channel_ID
    };
  }

  /**
  * Checks if a message starts with the current search value.
  * @param {string} message - The message text.
  * @return {boolean} - Returns true if message is relevant, otherwise returns false.
  */
  checkMessageRelevant(message) {
    return message.toLowerCase().startsWith(this.searchValue.toLowerCase());
  }

  /**
  * Checks and sets the `noResults` variable based on the filtered data's length.
  */
  show() {
    if (this.searchValue.length > 0 && this.filteredChannels.length > 0 ||
      this.searchValue.length > 0 && this.filteredUsers.length > 0 ||
      this.searchValue.length > 0 && this.filteredChannelMessages.length > 0) {
      this.noResults = false;
    } else this.noResults = true;
  }

  /**
  * Clears the data sets and filtered results.
  */
  clear() {
    this.userList = [];
    this.channelList = [];
    this.channelMessages = [];
    this.filteredChannels = [];
    this.filteredUsers = [];
    this.filteredChannelMessages = [];
  }

  /**
  * Returns true if there are no results, false otherwise.
  */
  checkResults(): boolean {
    return this.filteredChannels.length === 0 && this.filteredChannelMessages.length === 0 && this.filteredUsers.length === 0 && this.noResults && !this.isLoading;
  }

  /**
  * Opens the profile of a user.
  * @param {any} user - The user object.
  */
  openProfile(user) {
    this.searchValue = '';
    this.profileService.openProfile(user.uid);
  }

  /**
  * Opens a specific channel.
  * @param {string} channelID - ID of the channel.
  */
  openChannel(channelID: string) {
    this.searchValue = '';
    this.openChatService.openChat(channelID, 'channels');
  }
}

