import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewMsgService } from 'services/new-msg.service';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

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
    public newMsgService: NewMsgService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService
  ) {}

async sendMsg(user_id: string, user_name:string) {
  this.newMsgService.user_id = user_id;
  this.newMsgService.user_name = user_name;
  console.log(user_id, user_name);
  this.findChatWithUser(this.chatService.currentUser_id, this.newMsgService.user_id);
  this.newMsgService.directedFromProfileButton = true;
  this.close();
}

async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
  try {
    for (const chat of this.chatService.chats) {
      if (chat.chat_Member_IDs) {
        if (
          chat.chat_Member_IDs.includes(currentUserUID) &&
          chat.chat_Member_IDs.includes(selectedUserUID)
        ) {
          console.log("Chat gefunden");
          this.openChat(chat);
          return;
        }
      }
    }
    console.log("Kein Chat gefunden, erstelle neuen");
    this.createNewChat();
  } catch (error) {
    console.error("Fehler in findChatWithUser: ", error);
  }
}

async createNewChat() {
    this.newMsgService.openNewMsg = true;
    this.chatService.currentChatSection = 'chats';
    this.chatService.newChat(this.newMsgService.user_id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.chatService.currentChatID = await this.chatService.searchChat(this.newMsgService.user_id);
    console.log("currentChatID nach searchChat: ", this.chatService.currentChatID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    console.log("currentChatData: ", this.chatService.currentChatData);
    this.chatService.textAreaMessageTo();
    this.msgService.getMessages();
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

  close() {
    this.dialog.closeAll()
  }

  getImageUrl(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.avatar
  }

}
