import { Component, OnInit } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { OpenChatService } from 'services/open-chat.service';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit {
  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  openNewMsg: boolean = false;
  sortedChats: any[];
  currentChannelId: string;

  constructor(
    public authService: AuthenticationService,
    public dialog: MatDialog,
    public channelService: ChannelService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public genFunctService: GeneralFunctionsService,
    public openChatService: OpenChatService
  ) { }


  /**
  * Component's initialization method. Waits for authentication, 
  * loads chats, and initializes own chat. If it's a new user, loads the start channel.
  */
  async ngOnInit() {
    await this.checkLocalStorage();
    await this.chatService.loadChats();
    await this.chatService.initOwnChat();
    this.sortedChats = this.sortChats(this.chatService.chats);
    this.getCurrentChannel();
  }

  /**
  * Checks if userData is available in local storage
  */
  async checkLocalStorage() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user.uid) this.chatService.currentUser_id = user.uid;
    else this.chatService.currentUser_id = await this.authService.auth.currentUser.uid;
  }

  /**
  * Opens automatically the default channel or new created channel
  */
  getCurrentChannel() {
    this.channelService.createdChannelId$.subscribe((channelId) => {
      this.currentChannelId = channelId;
      if (this.currentChannelId) this.openChatService.openChat(this.currentChannelId, 'channels');
    });
  }

  /**
  * Checks for mobile logo state and toggles new message component.
  */
  sendNewMsg() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true;
    this.msgService.emptyMessageText();
    this.toggleNewMsgComponent();
  }

  /**
  * Opens the add channel dialog and handles its close event.
  */
  openAddChannelDialog() {
    this.dialog.open(AddChannelComponent, { panelClass: 'add-channel-dialog' });
  }

  /**
  * Checks the screen width and updates the mobile logo state accordingly.
  */
  checkChangeToMobileLogo() {
    if (window.innerWidth <= 1000) {
      this.genFunctService.changeMobileLogo = true;
    }
  }

  /**
  * Toggles the visibility of the new message component.
  */
  toggleNewMsgComponent() {
    this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
  }

  /**
    * Toggles the visibility of the channels.
    */
  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }

  /**
   * Toggles the visibility of direct messages.
   */
  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }

  /**
  * Compares the current chat ID with the receiver's ID to determine if they're different.
  * @param {string} userReceiverID - User receiver's ID.
  * @return {boolean} - Whether the current chat ID is different from the user receiver's ID.
  */
  checkIfSameChatID(userReceiverID: string) {
    return this.chatService.currentChatID !== userReceiverID;
  }

  /**
   * Determines if a chat is selfchat.
   * @param {Object} chat - The chat object to check.
   * @return {boolean} - True if the chat is associated with the current user, false otherwise.
   */
  isCurrentUserChat(chat: { chat_Member_IDs: any[]; }): boolean {
    return chat.chat_Member_IDs[0] === chat.chat_Member_IDs[1] ? true : false;
  }

  /**
   * Sorts an array of chats to place the chat associated with the current user at the beginning.
   * If both chats being compared are or aren't associated with the current user, their relative order remains unchanged.
   * @param {Object[]} chats - The array of chat objects to be sorted.
   * @return {Object[]} - The sorted array of chats.
   */
  sortChats(chats: any[]): any[] {
    return chats.sort((a, b) => {
      if (this.isCurrentUserChat(a) && !this.isCurrentUserChat(b)) {
        return -1;
      }
      return 0;
    });
  }
}


