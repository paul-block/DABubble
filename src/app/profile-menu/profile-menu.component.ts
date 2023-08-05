import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {
  detailsVisible: boolean = false;
  editDetailsVisible: boolean = false;

  constructor(public authService: AuthenticationService, private dialog: MatDialog) {
  }

  signOut() {
    this.authService.signOut();
    this.dialog.closeAll();
  }

  toggleDetails() {
    this.detailsVisible = !this.detailsVisible;
  }

  toggleEditDetails() {
    this.editDetailsVisible = !this.editDetailsVisible;
  }

  updateUserDetails() {
    this.authService.updateUserDetails(this.authService.userData.user_name, this.authService.userData.email);
    this.dialog.closeAll();
}
}
