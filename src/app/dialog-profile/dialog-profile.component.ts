import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';
import { NewMsgService } from 'src/services/new-msg.service';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent {


 constructor(
  public authService: AuthenticationService, 
  @Inject(MAT_DIALOG_DATA) public data: any,
  public dialog: MatDialog,
  public newMsgService: NewMsgService
 ) {
  this.user_name = data.user_name;
  this.user_email = data.user_email;
  this.user_id = data.user_id
  this.user_status = data.user_status;
 }

 user_name:string
 user_email:string
 user_id:string
 user_status:string = 'offline';
 offline = true;

 sendMsg(user_name:string) {
  this.newMsgService.toggleNewMsg();
  this.newMsgService.directedFromProfileButton = true;
  this.newMsgService.user_name = user_name;
  this.close();
 }

 close() {
  this.dialog.closeAll()
 }


 getImageUrl(uid: string): string {
  const user = this.authService.all_users.find(element => element.uid === uid);
  return user.avatar
}

}
