import { Component } from '@angular/core';
import { DirectChatService } from 'services/directchat.service';
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
){

}
}
