import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogEditMembersComponent } from '../dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';
import { DirectChatService } from 'src/services/directchat.service';
import { MessagesService } from 'src/services/messages.service';


@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})

export class ChannelDirectChatComponent {

  @Output() threadOpen = new EventEmitter<boolean>();

  messageCreator: boolean = false;
  toggleEditMessage: boolean = false;
  toggleReactionEmojis: boolean = false;
  isEditChannelDialogOpen: boolean = false;
  isEditMembersDialogOpen: boolean = false;
  isAddMembersDialogOpen: boolean = false;
  @ViewChild('editChannelREF') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  @ViewChild('editMembersREF') public ElementEditMembersRef: ElementRef<HTMLDivElement>;
  @ViewChild('addMembersREF') public ElementAddMembersRef: ElementRef;
  dialogEditChannelRef: MatDialogRef<DialogEditChannelComponent>;
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;
  dialogAddMembersRef: MatDialogRef<DialogAddMembersComponent>;

  constructor(
    private dialog: MatDialog,
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public dataDirectChatService: DirectChatService,
    public msgService: MessagesService,
  ) { }

  editChannel() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
    };
    dialogConfig.panelClass = 'custom-edit-channel-dialog';

    this.dialogEditChannelRef = this.dialog.open(DialogEditChannelComponent, dialogConfig);
    this.isEditChannelDialogOpen = true;

    this.dialogEditChannelRef.afterClosed().subscribe(() => {
      this.isEditChannelDialogOpen = false;
    });
  }

  editMembers() {
    const rect = this.ElementEditMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.right - 420}px`,
    };
    dialogConfig.panelClass = 'custom-edit-members-dialog';

    this.dialogEditMembersRef = this.dialog.open(DialogEditMembersComponent, dialogConfig);
    this.isEditMembersDialogOpen = true;

    this.dialogEditMembersRef.afterClosed().subscribe((closedWithRedirection: boolean) => {
      if (closedWithRedirection) {
        this.dialogEditMembersRef = null;
        this.addMembers();
      }
      this.isEditMembersDialogOpen = false;
    });

  }

  addMembers() {
    const rect = this.ElementAddMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.right - 520}px`,
    };
    dialogConfig.panelClass = 'custom-edit-members-dialog';

    this.dialogAddMembersRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    this.isAddMembersDialogOpen = true;

    this.dialogAddMembersRef.afterClosed().subscribe(() => {
      this.isAddMembersDialogOpen = false;
    });

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

  isMessageCreator(user_Sender_ID) {
    const currentUserID = this.authService.getUid();
    if (currentUserID) {
      return user_Sender_ID === currentUserID;
    } else {
      return false;
    }

  }

  messageDateRange(chatMessage) {
    this.msgService.getTimestampDate(chatMessage.created_At);
    const messageDate = chatMessage.created_At.toDate();

    if (this.msgService.previousMessageDate === null) {
      this.msgService.previousMessageDate = messageDate;
      return true; // Erste Nachricht, also immer als unterschiedlich behandeln
    }

    const previousDate = this.msgService.previousMessageDate;
    this.msgService.previousMessageDate = messageDate;

    if (
      messageDate.getDate() !== previousDate.getDate() ||
      messageDate.getMonth() !== previousDate.getMonth() ||
      messageDate.getFullYear() !== previousDate.getFullYear()
    ) {
      return true; // Das Datum ist unterschiedlich, also geben Sie true zurück
    } else {
      return false; // Das Datum ist gleich, also geben Sie false zurück
    }
  }

  public openThread(value: boolean) {
    this.threadOpen.emit(value)
  }
}
