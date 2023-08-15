import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { AuthenticationService } from 'src/services/authentication.service';

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


  constructor(private dialog: MatDialog, public authService: AuthenticationService) { }



  openProfileMenu() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom + 5}px`,
      right: `25px`,
    };
    dialogConfig.panelClass = 'custom-edit-channel-dialog';

    this.profileMenuRef = this.dialog.open(ProfileMenuComponent, dialogConfig);
    this.profileMenuOpen = true;

    this.profileMenuRef.afterClosed().subscribe(() => {
      this.profileMenuOpen = false;
    });
  }
}
