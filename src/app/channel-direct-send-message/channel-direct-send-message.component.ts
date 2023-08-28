import { Component, Input } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { NewMsgService } from 'services/new-msg.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent{

  @Input() inputValue: string;
 
  constructor(
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public newMsgService: NewMsgService,
    public fsDataThreadService: FirestoreThreadDataService
  ) { }

  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText += this.emojiService.textMessage;
    this.emojiService.textMessage = '';
    this.msgService.checkIfEmpty();
  }

  toggleEmojiPicker() {    
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
  }

  sendMsg(msg: string, channelOrUserInput: string) {
    msg = this.msgService.messageText;
    console.log(msg);
    this.newMsgService.addOrUpdateChat(msg, channelOrUserInput);
    this.msgService.messageText = '';
  }

  async openChannel(channelID) {
    if (this.newMsgService.newMsgComponentOpen) {
      this.newMsgService.toggleNewMsg();
      this.newMsgService.newMsgComponentOpen = !this.newMsgService.newMsgComponentOpen;
    }
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

  public async onSendClick() {
    if (this.newMsgService.newMsgComponentOpen) {
      this.sendMsg(this.msgService.messageText, this.inputValue);
    } else {
      this.msgService.newMessage();
    }
  }
}
