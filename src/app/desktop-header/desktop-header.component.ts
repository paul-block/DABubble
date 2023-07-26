import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';

@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {
  constructor(public dialog: MatDialog) {
    
  }

  openProfileMenu() {
    this.dialog.open(ProfileMenuComponent);
  } 
}
