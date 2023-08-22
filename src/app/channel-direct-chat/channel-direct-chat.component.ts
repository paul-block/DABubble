import { Component } from "@angular/core";
import { DirectChatService } from "services/directchat.service";
import { MessagesService } from "services/messages.service";



@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})

export class ChannelDirectChatComponent{
  constructor(
    public dataDirectChatService: DirectChatService,
    public msgService: MessagesService,
  ) { }
}
