import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChannelService } from 'services/channel.service';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent {

  constructor(
    public authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    public dialog: MatDialog,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public channelService: ChannelService
  ) {}


async sendMsg(user_id: string, user_name: string) {
  this.setReceiverData(user_id, user_name);
  this.findChatWithUser(this.chatService.currentUser_id, this.chatService.userReceiverID);
  this.chatService.directedFromProfileButton = true;
  this.close();
}


async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
    for (const chat of this.chatService.chats) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) &&
          chat.chat_Member_IDs.includes(selectedUserUID)) {
          this.openChat(chat.chat_ID);
          return;
        }
    }
    this.createNewChat();
}


async openChat(id: string) {
  this.ensureChatSectionVisible();
  if (this.chatService.currentChatID !== id) {
    this.chatService.currentChatSection = 'chats';
    this.setCurrentID(id);
    await this.getCurrentData();
  }
}


async createNewChat() {
  this.chatService.openNewMsgComponent = true;
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID = await this.chatService.newChat(this.chatService.userReceiverID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    this.chatService.textAreaMessageTo();
    this.msgService.getMessages();
}


setCurrentID(id: string) {
  this.chatService.currentChatID = id;
  this.msgService.emptyMessageText();
}


async getCurrentData() {
  this.chatService.getCurrentChatData();
  this.chatService.textAreaMessageTo();
  this.msgService.getMessages().then(() => {
    this.chatService.thread_open = false;
    this.msgService.scrollToBottom('channel')
  });
}


ensureChatSectionVisible() {
  this.chatService.open_chat = true
  this.chatService.userReceiverName = '';
  if (this.chatService.openNewMsgComponent)  this.chatService.openNewMsgComponent = false;
}


setReceiverData(user_id: string, user_name: string) {
  this.chatService.userReceiverID = user_id;
  this.chatService.userReceiverName = user_name;
}


close() {
  this.dialog.closeAll()
}

}
