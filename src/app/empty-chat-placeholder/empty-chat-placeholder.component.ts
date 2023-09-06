import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';

@Component({
  selector: 'app-empty-chat-placeholder',
  templateUrl: './empty-chat-placeholder.component.html',
  styleUrls: ['./empty-chat-placeholder.component.scss']
})
export class EmptyChatPlaceholderComponent {
constructor(
  public authService: AuthenticationService,
  public chatService: ChatService,
){}
}
