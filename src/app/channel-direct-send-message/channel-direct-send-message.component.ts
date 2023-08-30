import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { NewMsgService } from 'services/new-msg.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';
import { AuthenticationService } from 'services/authentication.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent implements OnInit {

  @Input() inputValue: string;
  open_attachment_menu: boolean = false;
  open_users: boolean = false;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public newMsgService: NewMsgService,
    public fsDataThreadService: FirestoreThreadDataService,
    public uploadService: UploadService,
  ) { }

  ngOnInit(): void {
    document.body.addEventListener('click', this.bodyClicked);
  }

  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText += this.emojiService.textMessage;
    this.emojiService.textMessage = '';
    this.msgService.checkIfEmpty();
  }

  toggleEmojiPicker() {
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
  }

  public async onSendClick() {
    if (this.newMsgService.openNewMsg) {
      this.uploadService.checkForUpload();
      await this.msgService.newMessage();
      setTimeout(() => this.uploadService.emptyUploadArray(), 500);
      this.newMsgService.openNewMsg = !this.newMsgService.openNewMsg;
      console.log(this.chatService.currentChatData);
    } else {
      await this.uploadService.checkForUpload();
      setTimeout(() => {
        this.msgService.newMessage();
      }, 400);
      setTimeout(() => this.uploadService.emptyUploadArray(), 500);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  };

  openAttachmentMenu() {
    this.open_attachment_menu = !this.open_attachment_menu;
  }

  bodyClicked = () => {
    // if (this.emojiPicker_open == true) this.emojiPicker_open = false;
    // if (this.edit_comment == true) this.edit_comment = false;
    // if (this.chatService.open_users == true) {
    //   this.chatService.open_users = false;
    //   this.getAllUsers()
    // }
    // if (this.open_attachment_menu == true) this.open_attachment_menu = false
  };

  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.msgService.messageText = this.chatService.addUserToTextarea(i, this.msgService.messageText)
  }

  openUsers() {
    this.getAllUsers()
    this.open_users = !this.open_users;
  }


  async getAllUsers() {
    this.chatService.at_users = await this.authService.getAllUsers();
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
}
