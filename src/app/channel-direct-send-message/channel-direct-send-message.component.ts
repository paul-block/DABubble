import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {
  readyToSend: boolean = false;
  placeholder = 'Nachricht an #Entwicklerteam';
  messageField: string = '';

constructor(
  public authenticationService: AuthenticationService
){}

  checkIfEmpty() {
    if (this.messageField.length) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }

  sendMessage() {
    this.authenticationService.newMessage(this.messageField);
  }
}
