import { Component } from '@angular/core';
import { ChannelService } from 'services/channel.service';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { OpenChatService } from 'services/open-chat.service';

@Component({
  selector: 'app-new-msg',
  templateUrl: './new-msg.component.html',
  styleUrls: ['./new-msg.component.scss']
})
export class NewMsgComponent {

  inputValue: string;
  filteredUsersByName = [];
  filteredUsersByEmail = [];
  authorizedChannels = [];
  filteredChannels = [];
  selectedValue: string;
  uid: string;

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
    public openChatService: OpenChatService) {

      this.uid = this.authService.userData.uid;
      if (this.chatService.directedFromProfileButton && this.chatService.userReceiverName) {
        this.inputValue = '@' + this.chatService.userReceiverName;
      }
      else {
        this.inputValue = '';
        this.chatService.messageToPlaceholder = 'Nachricht an ...';
      }
  }


  async valueChange(value: string) {
    this.clearArrays();
    this.filteredUsersByName = await this.authService.filterUsers(value);
    this.filteredUsersByEmail = await this.authService.filterUsersByEmail(value);
    this.authorizedChannels = await this.channelService.getChannels(this.uid);
    this.filteredChannels = this.authorizedChannels.filter(channel => channel.channelName.toLowerCase().startsWith(value.toLowerCase())
    );
  }

  
  selectValue(event: Event, category: string, id:string) {
    const clickedValue = ((event.currentTarget as HTMLElement).querySelector('span:not(.tag)') as HTMLElement).innerText;
    if (category == 'userName' || category == 'userEmail') {
      this.checkExistingChat(id, clickedValue);
    } 
    if (category == 'channel') {
      this.openChatService.openChat(id, 'channels')
    } 
    this.selectedValue = clickedValue;
    this.clearArrays();
  }


  async checkExistingChat(selectedUser, clickedValue?: string) {
    const currentUserUID = this.chatService.currentUser_id;
    if (await this.findChatWithUser(currentUserUID, selectedUser.uid)) return;
    await this.createNewChat(selectedUser, clickedValue);
  }
  
  
  async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
    for (const chat of this.chatService.chats) {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) &&
          chat.chat_Member_IDs.includes(selectedUserUID)
        ) {
          this.openChatService.openChat(chat.chat_ID);
          return true;
        }
      }
    }
    return false;
  }
  

  async createNewChat(selectedUser, clickedValue: string) {
    this.inputValue = '@' + clickedValue;
    this.chatService.userReceiverID = selectedUser.uid;
    this.chatService.messageToPlaceholder = `Nachricht an ${selectedUser.user_name}`;
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID =  await this.chatService.newChat(this.chatService.userReceiverID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    this.msgService.getMessages();
  }
  
  
  clearArrays() {
    this.filteredUsersByName = [];
    this.filteredUsersByEmail = [];
    this.filteredChannels = [];
  }

  closeChat() {
    this.chatService.open_chat = false
    setTimeout(() => {
      this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
    }, 300);
  }
}


