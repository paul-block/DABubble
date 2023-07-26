import { Component } from '@angular/core';

@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})
export class ChannelDirectChatComponent {
  messageCreator = true;
  toggleEditMessage: boolean = false;
  toggleReactionEmojis: boolean = false;
  toggleEditChannel: boolean = false;

  editMessage() {

  }

  resetToggledAreas() {
    this.toggleReactionEmojis = false;
    this.toggleEditMessage = false;
  }

  toggleArea(toggleArea) {
    switch (toggleArea) {
      case 'more':
        this.toggleReactionEmojis = false;
        this.toggleEditMessage = !this.toggleEditMessage;
        break;
      case 'emojis':
        this.toggleEditMessage = false;
        this.toggleReactionEmojis = !this.toggleReactionEmojis;
        break;
      case 'edit-channel':
        this.toggleEditChannel = !this.toggleEditChannel;
        break;

      default:
        break;
    }
  }
}
