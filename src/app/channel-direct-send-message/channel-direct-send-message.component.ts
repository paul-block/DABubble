import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { NewMsgService } from 'services/new-msg.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';
import { AuthenticationService } from 'services/authentication.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {

  @Input() inputValue: string;
  open_attachment_menu: boolean = false;
  open_users: boolean = false;
  emojiPicker_open: boolean = false;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public newMsgService: NewMsgService,
    public fsDataThreadService: FirestoreThreadDataService,
    public uploadService: UploadService,
    public genFService: GeneralFunctionsService,
    private elementRef: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open_attachment_menu = false;
      this.open_users = false;
      if (this.emojiService.picker_index === 0) {
        this.emojiPicker_open = false;
      }
    }
  }


  togglePopup(popupVariable: string) {
    this[popupVariable] = !this[popupVariable];
    if (this[popupVariable]) {
      this.closeOtherPopups(popupVariable);
    }
    if (popupVariable === 'open_users') {
      this.getAllUsers()
    }
    this.emojiService.emojiPicker_open = this.emojiPicker_open;
  }
  

  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['open_attachment_menu', 'open_users', 'emojiPicker_open'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) {
        this[popup] = false;
      }
    });
  }


  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText += this.emojiService.textMessage;
    this.emojiService.textMessage = '';
    this.msgService.checkIfEmpty();
  }


  toggleEmojiPicker() {
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
    if (this.emojiService.emojiPicker_open) {
      this.closeOtherPopups('emojiPicker_open');
    }
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


  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.msgService.messageText = this.chatService.addUserToTextarea(i, this.msgService.messageText)
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