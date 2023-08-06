import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { DirectChatService } from 'src/services/directchat.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {
  readyToSend: boolean = false;
  placeholder = 'Nachricht an #Entwicklerteam';
  messageText: string = '';

  constructor(
    public authService: AuthenticationService,
    public directChatService: DirectChatService
  ) { }

  checkIfEmpty() {
    if (this.messageText.length) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

  sendMessage() {
    this.directChatService.newMessage(this.messageText);
  }
}
