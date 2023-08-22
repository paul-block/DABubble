import { Component } from '@angular/core';
import { DirectChatService } from 'services/directchat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-channel-direct-edit-message',
  templateUrl: './channel-direct-edit-message.component.html',
  styleUrls: ['./channel-direct-edit-message.component.scss']
})
export class ChannelDirectEditMessageComponent {
constructor(
  public directChatService: DirectChatService,
  public msgService: MessagesService,
  public emojiService: EmojiService,
){}

addEmojitoTextarea($event: any) {
  this.emojiService.addEmojitoTextarea($event)
  this.msgService.messageText += this.emojiService.textMessage;
  this.emojiService.textMessage = '';
  this.msgService.checkIfEmpty();
}

toggleEmojiPicker() {    
  this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
}
}
