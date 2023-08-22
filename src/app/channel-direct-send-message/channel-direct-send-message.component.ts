import { AfterViewInit, Component, Input } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { DirectChatService } from 'services/directchat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { NewMsgService } from 'services/new-msg.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent{

  @Input() inputValue: string;
 


  constructor(
    public directChatService: DirectChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public newMsgService: NewMsgService
  ) { }

  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText = this.emojiService.textMessage;
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

  public onSendClick(): void {
    if (this.newMsgService.newMsgComponentOpen) {
      this.sendMsg(this.msgService.messageText, this.inputValue);
    } else {
      this.msgService.newMessage();
    }
  }
}
