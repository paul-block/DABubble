import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { DirectChatService } from 'src/services/directchat.service';
import { EmojiService } from 'src/services/emoji.service';
import { MessagesService } from 'src/services/messages.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {
  placeholder = 'Nachricht an #Entwicklerteam';

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
}
