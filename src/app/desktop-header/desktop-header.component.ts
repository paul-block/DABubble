import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {

  @ViewChild('profile') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  profileMenuRef: MatDialogRef<ProfileMenuComponent>;
  profileMenuOpen: boolean = false;
  all_users: any[];


  constructor(private dialog: MatDialog, 
    public authService: AuthenticationService,
     public fsDataThreadService: FirestoreThreadDataService,
     public chatService: ChatService, 
     public genFuncService: GeneralFunctionsService) { }


  openProfileMenu() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    if (window.innerWidth <= 1000) {
      dialogConfig.position = {
          bottom: `0px`
      }
      dialogConfig.panelClass = 'mobile-profile-menu-dialog';
  } else {
      dialogConfig.position = {
          top: `${rect.bottom + 5}px`,
          right: `25px`
      };
      dialogConfig.panelClass = 'custom-open-profile-menu-dialog';
  }
   

    this.profileMenuRef = this.dialog.open(ProfileMenuComponent, dialogConfig);
    this.profileMenuOpen = true;

    this.profileMenuRef.afterClosed().subscribe(() => {
      this.profileMenuOpen = false;
      this.fsDataThreadService.detailsVisible = false
    });
  }

  closeChat() {
    this.genFuncService.changeMobileLogo = false;
    this.chatService.open_chat = false
  }
}
