import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';

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
  @ViewChild('editChannelREF') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  constructor(private dialog: MatDialog) { }

  editChannel() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
    };
    dialogConfig.panelClass = 'custom-edit-channel-dialog';

    this.dialog.open(DialogEditChannelComponent, dialogConfig);
  }

  public editMessage() {
    // this.dialog.open(DialogEditChannelComponent);
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
      default:
        break;
    }
  }
}
