import { AfterViewInit, Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { DirectChatService } from 'services/directchat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent{

  constructor(
    public directChatService: DirectChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService
  ) { }


  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText = this.emojiService.textMessage;
    this.msgService.checkIfEmpty();
  }

  toggleEmojiPicker() {    
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
  }

}
