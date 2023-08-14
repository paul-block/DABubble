import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent {
 constructor(
  public authService: AuthenticationService,   
  @Inject(MAT_DIALOG_DATA) public data: any,
  public dialog: MatDialog
 ) {
  this.user_name = data.user_name;
  this.user_email = data.user_email;
 }

 user_name;
 user_email;

 sendMsg() {

 }

 close() {
  this.dialog.closeAll()
 }
}
