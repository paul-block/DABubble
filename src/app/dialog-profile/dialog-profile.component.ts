import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { NewMsgService } from 'services/new-msg.service';

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

  user_name: string
  user_email: string
  user_id: string
  user_status: string = 'offline';
  offline = true;

  sendMsg(user_id: string, user_name:string) {
    this.newMsgService.openNewMsg = true;
    this.newMsgService.directedFromProfileButton = true;
    this.newMsgService.user_id = user_id;
    this.newMsgService.user_name = user_name;
    console.log(user_id, user_name);
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
