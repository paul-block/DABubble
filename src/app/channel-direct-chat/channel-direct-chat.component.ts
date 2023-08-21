import { AfterViewChecked, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogEditMembersComponent } from '../dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { DirectChatService } from 'services/directchat.service';
import { MessagesService } from 'services/messages.service';
import { EmojiService } from 'services/emoji.service';
import { Observable, Subscription } from 'rxjs';
import { doc, getFirestore, onSnapshot } from '@angular/fire/firestore';


@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})

export class ChannelDirectChatComponent{
  db = getFirestore();

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
}
