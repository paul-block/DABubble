import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogEditMembersComponent } from '../dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { ProfileService } from 'services/profile.service';
import { ChannelService } from 'services/channel.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-header-channel-direct-chat',
  templateUrl: './header-channel-direct-chat.component.html',
  styleUrls: ['./header-channel-direct-chat.component.scss']
})
export class HeaderChannelDirectChatComponent {

  isEditChannelDialogOpen: boolean = false;
  isEditMembersDialogOpen: boolean = false;
  isAddMembersDialogOpen: boolean = false;
  @ViewChild('editChannelREF') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  @ViewChild('editMembersREF') public ElementEditMembersRef: ElementRef<HTMLDivElement>;
  @ViewChild('addMembersREF') public ElementAddMembersRef: ElementRef;
  dialogEditChannelRef: MatDialogRef<DialogEditChannelComponent>;
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;
  dialogAddMembersRef: MatDialogRef<DialogAddMembersComponent>;
  windowWidth: number;



  constructor(
    private dialog: MatDialog,
    public authService: AuthenticationService,
    public chatService: ChatService,
    public profileService: ProfileService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService
  ) {
    this.windowWidth = window.innerWidth;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
  }


  editChannel() {
    if (this.windowWidth > 1000) {
      this.openEditChannel();
    } else if (this.windowWidth < 1000) {
      this.openEditChannelMobile();
    }
  }

  openEditChannel() {
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

  openEditChannelMobile() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `100px`,
      left: `0px`
    };
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.height = '100vh';
    dialogConfig.panelClass = 'custom-edit-channel-dialog';

    this.dialogEditChannelRef = this.dialog.open(DialogEditChannelComponent, dialogConfig);
    this.isEditChannelDialogOpen = true;
    this.genFunctService.isMobileScreen = true;

    this.dialogEditChannelRef.afterClosed().subscribe(() => {
      this.isEditChannelDialogOpen = false;
    });

    this.dialogEditChannelRef.afterClosed().subscribe((closedWithRedirection: boolean) => {
      if (closedWithRedirection && this.windowWidth < 1000) {
        this.dialogEditChannelRef = null;
        this.addMemberMobile();
      }
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
      if (closedWithRedirection && this.windowWidth > 1500) {
        this.dialogEditMembersRef = null;
        this.addMembers();
      } else if (closedWithRedirection && this.windowWidth < 1500) {
        this.dialogEditMembersRef = null;
        this.addMemberMobile();
      }

      this.isEditMembersDialogOpen = false;
    });
  }


  addMembers() {
    if (this.windowWidth > 1500) {
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
    else this.editMembers()
  }


  addMemberMobile() {
    const rect = this.ElementAddMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.right - 520}px`,
    };
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.panelClass = 'custom-edit-members-dialog';
    this.dialogAddMembersRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    this.isAddMembersDialogOpen = true;
    this.dialogAddMembersRef.afterClosed().subscribe(() => {
      this.isAddMembersDialogOpen = false;
    });
  }



  channelMemberAvatars(id: string) {
    const user = this.authService.all_users.find(user => user.uid === id);
    return user.avatar;
  }

  closeChat() {
    this.chatService.open_chat = false
  }
}
