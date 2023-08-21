<<<<<<< Updated upstream
import { AfterViewInit, Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { DirectChatService } from 'services/directchat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';

=======
import { AfterViewInit, Component, Input } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { DirectChatService } from 'src/services/directchat.service';
import { EmojiService } from 'src/services/emoji.service';
import { MessagesService } from 'src/services/messages.service';
import { NewMsgService } from 'src/services/new-msg.service';
>>>>>>> Stashed changes
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
}
