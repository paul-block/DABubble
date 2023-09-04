import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { FormControl } from '@angular/forms';
import { UploadService } from 'services/upload.service';
import { switchMap } from 'rxjs/operators';
import { MessagesService } from 'services/messages.service';


@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent implements OnInit {

  certainInput: string;
  channelName: string;
  description: string;

  public searchControl = new FormControl();
  public selectedOptionControl = new FormControl('all');

  showSelectedUsers = false;

  filteredUsers: any[] = [];
  selectedUser: any[]  = [];

  constructor(
    public dialog: MatDialog,
    public authService: AuthenticationService,
    public dialogRef: MatDialogRef<AddPplToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public channelService: ChannelService,
    public uploadService: UploadService,
    public messageService: MessagesService
  ) {
    this.channelName = data.channelName;
    this.description = data.description;
  }


  ngOnInit(): void {
    this.searchControl.valueChanges
    .pipe(
      switchMap(value => this.filterUsers(value))
    )
    .subscribe(users => {
      this.filteredUsers = users;
    });
  }


  addUser(user: object) {
    this.selectedUser.push(user);
    this.showSelectedUsers = true;
    this.searchControl.setValue('');
  }


  async filterUsers(name: string): Promise<any[]> {
    const users = await this.authService.usersWithoutCurrentuser();
    const filteredUser = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUser;
  }


  deleteSelectedUser(user) {
    const index = this.selectedUser.indexOf(user);
    if (index > -1) {
      this.selectedUser.splice(index, 1);
    }
  }


  closeDialog() {
    this.dialog.closeAll();
  }


  async createNewChannel() {
    await this.channelService.createNewChannel(this.channelName, this.description);
    if (this.selectedOptionControl.value === 'all') {
      const members = this.authService.all_users
      members.forEach(member => {
        let id = member.uid
        this.channelService.addUserToChannel(this.channelName, id);
      });
      setTimeout(() => this.sendAddAllMemberMessage() , 300);
    } else if (this.selectedOptionControl.value === 'certain' && this.selectedUser.length > 0) {
      this.selectedUser.forEach(user => {
          this.channelService.addUserToChannel(this.channelName, user.uid);
      });
      setTimeout(() => this.sendAddAMemberMessage(this.selectedUser) , 300);
    }
    this.showSelectedUsers = false;
    this.dialog.closeAll();
  }


  sendAddAllMemberMessage() {
    let users = []
    this.authService.all_users.forEach(element => {
      if (element.uid != this.authService.userData.uid) users.push(element.user_name)
    });
    let rest = users.length - 1
    this.uploadService.checkForUpload()
    this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + users[0] + ' und ' + rest + ' weitere beigetreten'
    this.messageService.newMessage()
  }


  sendAddAMemberMessage(array: any[]) {
    const userNames = array.map(obj => obj.user_name);
    let rest = array.length -1
    this.uploadService.checkForUpload()
    if(userNames.length > 2) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + userNames[0] + ' und ' + rest + ' weitere beigetreten.'
    if (userNames.length == 2)  this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + userNames[0] + ' und ' + rest + ' weitere(r) beigetreten.'
    if (userNames.length == 1) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem ist ' + userNames[0] + ' beigetreten.'
    this.messageService.newMessage()
  }
}
