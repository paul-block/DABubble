import { Component, ElementRef, ViewChild} from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';

@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {

  @ViewChild('profile') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  profileMenuRef: MatDialogRef<ProfileMenuComponent>;
  profileMenuOpen: boolean = false;


  constructor(private dialog: MatDialog) { }

  openProfileMenu() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
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
