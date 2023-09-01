import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { UploadService } from 'services/upload.service';
import { MessagesService } from 'services/messages.service';


@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent implements OnInit {
  checkboxValue = false;
  selectedOption: string = 'all'
  certainInput: string;
  channelName: string;
  description: string;
  public searchControl = new FormControl();
  userId: string;
  // hideAutocomplete = true;
  userSelected = false;
  DelevoperTeamChannelRef = 'm3eNJFz61Ixm1cme5qAf';
  counter: number = 0
  selectedUserNames: string[] = [];
  selectedUserAvatar: string[] = [];



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
    this.authService.addCertainUserValue.subscribe(value => {
      this.searchControl.setValue(value, { emitEvent: false });
    });
    this.searchControl.valueChanges.subscribe(inputValue => {
      this.authService.updateCertainUserValue(inputValue);
    });
    this.channelService.currentUserId.subscribe(userId => {
      this.userId = userId;
    });
    this.channelService.userSelected$.subscribe(
      userName => {
        this.selectedUserNames.push(userName);
        this.searchControl.setValue('');
        this.authService.updateCertainUserValue('');
        this.channelService.showSelectedUser(true);
        this.channelService.toggleAutocomplete(true);
      }
    );

    this.channelService.userAvatar$.subscribe(
      avatar => {
        this.selectedUserAvatar.push(avatar);
      }
    );
  }

  removeUserName(name: string) {
    const index = this.selectedUserNames.indexOf(name);
    if (index > -1) {
      this.selectedUserNames.splice(index, 1);
    }
  }

  deleteSelectedUser(userName: string) {
    this.removeUserName(userName);
    this.authService.updateCertainUserValue('');
    // this.channelService.showSelectedUser(false);
    // this.channelService.toggleAutocomplete(true);
  }

  closeDialog() {
    this.dialog.closeAll();
  }


  async createNewChannel() {
    await this.channelService.createNewChannel(this.channelName, this.description);
    if (this.selectedOption === 'all') {
      const members = this.authService.all_users
      members.forEach(member => {
        let id = member.uid
        this.channelService.addUserToChannel(this.channelName, id);
      });
      setTimeout(() => this.sendAddAllMemberMessage() , 300);
    } else if (this.selectedOption === 'certain' && this.selectedUserNames.length > 0) {
      const userIds = await Promise.all(
        this.selectedUserNames.map(userName => this.channelService.findUserByName(userName))
      );
      userIds.forEach(userId => {
        if (userId) {
          this.channelService.addUserToChannel(this.channelName, userId);
        }
      });
      setTimeout(() => this.sendAddAMemberMessage(this.selectedUserNames) , 300);
    }
    this.channelService.showSelectedUser(false);
    this.channelService.toggleAutocomplete(true);
    this.dialog.closeAll();
  }


  onSelectedOptionChange() {
    this.selectedUserAvatar = []
    this.selectedUserNames = []
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

  sendAddAMemberMessage(array: string[]) {
    let rest = array.length -1
    this.uploadService.checkForUpload()
    if(array.length > 2) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + array[0] + ' und ' + rest + ' weitere beigetreten.'
    if (array.length == 2)  this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + array[0] + ' und ' + rest + ' weitere(r) beigetreten.'
    if (array.length == 1) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem ist ' + array[0] + ' beigetreten.'
    this.messageService.newMessage()
  }
}
