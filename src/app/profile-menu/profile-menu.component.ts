import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {
  detailsVisible: boolean = false;
  editDetailsVisible: boolean = false;

  toggleDetails() {
    this.detailsVisible = !this.detailsVisible;
  }

  toggleEditDetails() {
    this.editDetailsVisible = !this.editDetailsVisible;
  }
}
