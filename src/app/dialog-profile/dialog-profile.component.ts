import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';

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
  this.user_id = data.user_id
 }

 user_name:string
 user_email:string
 user_id:string

 sendMsg() {

 }

 close() {
  this.dialog.closeAll()
 }


 getImageUrl(uid: string): string {
  const user = this.authService.all_users.find(element => element.uid === uid);
  return user.avatar
}

}
