import { Component } from '@angular/core';
import { NewMsgService } from 'services/new-msg.service';
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

  constructor(public newMsgService: NewMsgService,
     public authService: AuthenticationService,
      public channelService: ChannelService,
      public chatService: ChatService,
      public msgService: MessagesService,
      public fsDataThreadService: FirestoreThreadDataService
      ) {

    this.uid = this.authService.getUid();

    if (this.newMsgService.directedFromProfileButton) {
      this.inputValue = '@' + this.newMsgService.user_name;
    }
    else this.inputValue = ''
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

  async checkExistingChat(selectedUser, clickedValue?: string){
    const currentUserUID = this.chatService.currentUser_id; 
    let userFound = false; 
  
    this.chatService.chats.forEach(chat => {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) && 
          chat.chat_Member_IDs.includes(selectedUser.uid)
        ) {
          console.log("chat gefunden");
          this.openChat(chat);
          userFound = true;
          return;
        }
      }
    });
  
    if (!userFound) {
      console.log("Neuer chat");
      this.inputValue = '@' + clickedValue;
      this.chatService.userReceiverID = selectedUser.uid;
      this.chatService.messageToPlaceholder = `Nachricht an ${selectedUser.user_name}`;
      await this.chatService.newChat(this.chatService.userReceiverID);
      this.chatService.currentChatSection = 'chats';
      this.chatService.currentChatID = await this.chatService.searchChat(this.chatService.userReceiverID);
      this.chatService.currentChatData = await this.chatService.getChatDocument();
      console.log(this.chatService.currentChatData)
    }
  }

  async openChat(chat) {
    if (this.newMsgService.openNewMsg) this.newMsgService.openNewMsg = false;
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
    if (this.newMsgService.openNewMsg) this.newMsgService.openNewMsg = false;
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

    // ZUR SICHERHEIT FUNKTIONIERENDE VARIANTE 

  // checkExistingChat(selectedUserUID: string) {
  //   const currentUserUID = this.chatService.currentUser_id; // Ihre eigene UID
  
  //   for (const chat of this.chatService.chats) { // Durchlaufen aller Chats im Array
  //     if (chat.chat_Member_IDs) {
  //       if (
  //         chat.chat_Member_IDs.includes(currentUserUID) && 
  //         chat.chat_Member_IDs.includes(selectedUserUID)
  //       ) {
  //         // Chat zwischen den beiden Benutzern gefunden
  //         console.log("Nutzer gefunden");
  //         return;
  //       }
  //     }
  //   }
    
  //   console.log("Nutzer nicht gefunden");
  // }


  // USPRÜNGLICHE FUNKTION 

  // selectValue(event: Event, category: string, uid?) {
  //   const clickedValue = ((event.currentTarget as HTMLElement).querySelector('span:not(.tag)') as HTMLElement).innerText;

  //   if (uid) this.newMsgService.user_id = uid;
  //   if (category == 'userName') this.inputValue = '@' + clickedValue;
  //   if (category == 'userEmail') this.inputValue = clickedValue;
  //   if (category == 'channel') {
  //     this.newMsgService.selectedChannelID = (this.filteredChannels.find(channel => channel.channelName === clickedValue)).channel_ID;
  //     this.inputValue = '#' + clickedValue;
  //   } 

  //   this.selectedValue = clickedValue;

  //   this.filteredUsersByName = [];
  //   this.filteredUsersByEmail = [];
  //   this.filteredChannels = [];
  // }


}


