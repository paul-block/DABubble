import { Component } from '@angular/core';
import { ChannelService } from 'services/channel.service';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

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
      public fsDataThreadService: FirestoreThreadDataService
      ) {

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
    this.filteredUsersByName = [];
    this.filteredUsersByEmail = [];
    this.filteredChannels = [];

    console.log(this.uid);
    this.filteredUsersByName = await this.authService.filterUsers(value);
    this.filteredUsersByEmail = await this.authService.filterUsersByEmail(value);
    this.authorizedChannels = await this.channelService.getChannels(this.uid);
    console.log(this.filteredChannels)
    this.filteredChannels = this.authorizedChannels.filter(channel => channel.channelName.toLowerCase().startsWith(value.toLowerCase())
    );
  }


  selectValue(event: Event, category: string, id:string) {
    const clickedValue = ((event.currentTarget as HTMLElement).querySelector('span:not(.tag)') as HTMLElement).innerText;
    if (category == 'userName' || category == 'userEmail') {
      this.checkExistingChat(id, clickedValue);
    } 
    if (category == 'channel') {
      this.openChannel(id);      
    } 
    this.selectedValue = clickedValue;
    this.filteredUsersByName = [];
    this.filteredUsersByEmail = [];
    this.filteredChannels = [];
  }


  async checkExistingChat(selectedUser, clickedValue?: string) {
    const currentUserUID = this.chatService.currentUser_id;
    
    if (currentUserUID === selectedUser.uid) {
      if (await this.findSelfChat(currentUserUID)) return;
    }

    if (await this.findChatWithUser(currentUserUID, selectedUser.uid)) return;
  
    await this.createNewChat(selectedUser, clickedValue);
  }
  

  async findSelfChat(currentUserUID: string) {
    for (const chat of this.chatService.chats) {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.length === 2 &&
          chat.chat_Member_IDs[0] === currentUserUID &&
          chat.chat_Member_IDs[1] === currentUserUID
        ) {
          console.log("Chat mit sich selbst gefunden");
          this.openChat(chat);
          return true;
        }
      }
    }
    return false;
  }
  

  async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
    for (const chat of this.chatService.chats) {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) &&
          chat.chat_Member_IDs.includes(selectedUserUID)
        ) {
          console.log("Chat gefunden");
          this.openChat(chat);
          return true;
        }
      }
    }
    return false;
  }
  

  async createNewChat(selectedUser, clickedValue: string) {
    console.log("Neuer chat erstellt");
    this.inputValue = '@' + clickedValue;
    this.chatService.userReceiverID = selectedUser.uid;
    this.chatService.messageToPlaceholder = `Nachricht an ${selectedUser.user_name}`;
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID =  await this.chatService.newChat(this.chatService.userReceiverID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    this.msgService.getMessages();
  }
  

  async openChat(chat) {
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
    if (this.chatService.currentChatID !== chat.chat_ID) {
      this.chatService.currentChatSection = 'chats';
      this.chatService.currentChatID = chat.chat_ID;
      this.msgService.emptyMessageText();
      try {
        this.chatService.currentChatData = chat;
        this.chatService.textAreaMessageTo();
        this.msgService.getMessages();
        this.fsDataThreadService.thread_open = false;
      } catch (error) {
        console.error("Fehler bei öffnen des Chats: ", error);
      }
    }
  }


  async openChannel(channelID) {
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
    if (this.chatService.currentChatID !== channelID) {
      this.chatService.currentChatSection = 'channels';
      this.chatService.currentChatID = channelID;
      this.msgService.emptyMessageText();
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
}


