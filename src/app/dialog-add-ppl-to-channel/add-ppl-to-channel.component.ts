import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { UploadService } from 'services/upload.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent {

  selectedCheckbox: string = '';
  userName: string = '';
  channelName: string;
  description: string;
  showSelectedUsers = false;
  userExists = false;
  filteredUsers: any = [];
  selectedUser: any[] = [];

  constructor(
    public dialog: MatDialog,
    public authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public channelService: ChannelService,
    public uploadService: UploadService,
    public messageService: MessagesService
  ) {
    this.channelName = data.channelName;
    this.description = data.description;
  }

  /**
  * Sets up the value changes listener for the search control. On value change, 
  * it filters users based on the input.
  */
  async getFilteredUsers(): Promise<void> {
    this.filteredUsers = [...await this.filterUsers(this.userName)];
    if (this.userName === '') this.userExists = false;
  }

  /**
  * Adds a user to the list of selected users if not already present.
  * @param {Object} user - User object to add.
  */
  addUser(user) {
    const userExists = this.selectedUser.some(existingUser => existingUser.user_name === user.user_name);
    if (!userExists) {
      this.selectedUser.push(user);
      this.showSelectedUsers = true;
      this.userName = '';
    } else {
      this.userExists = true;
    }
  }

  /**
  * Filters users based on the input name.
  * @param {string} name - Name string to filter users by.
  * @return {Promise<any[]>} - Returns a promise with filtered users.
  */
  async filterUsers(name: string): Promise<any[]> {
    const users = await this.authService.usersWithoutCurrentuser();
    const filteredUsers = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUsers;

  }

  /**
  * Deletes a selected user from the list.
  * @param {Object} user - User object to delete.
  */
  deleteSelectedUser(user) {
    const index = this.selectedUser.indexOf(user);
    if (index > -1) {
      this.selectedUser.splice(index, 1);
    }
  }

  /**
  * Creates a new channel and checks which members to add.
  */
  async createNewChannel() {
    await this.channelService.createNewChannel(this.channelName, this.description);
    this.checkWhichMembersToAdd();
    this.showSelectedUsers = false;
    this.dialog.closeAll();
  }

  /**
  * Checks which members to add to the newly created channel based on the selected option.
  */
  checkWhichMembersToAdd() {
    if (this.selectedCheckbox === 'all') {
      const members = this.authService.all_users;
      members.forEach(member => {
        this.channelService.addUserToChannel(this.channelName, member.uid);
      });
      setTimeout(() => this.sendAddAllMemberMessage(), 300);
    } else if (this.selectedCheckbox === 'certain' && this.selectedUser.length > 0) {
      this.selectedUser.forEach(user => {
        this.channelService.addUserToChannel(this.channelName, user.uid);
      });
      setTimeout(() => this.sendAddAMemberMessage(this.selectedUser), 300);
    }
  }

  /**
  * Sends a notification message when all members have been added to a channel.
  */
  sendAddAllMemberMessage() {
    let users = [];
    this.authService.all_users.forEach(element => {
      if (element.uid != this.authService.userData.uid) users.push(element.user_name);
    });
    let rest = users.length - 1;
    this.uploadService.checkForUpload();
    this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + users[0] + ' und ' + rest + ' weitere beigetreten';
    this.messageService.newMessage();
  }

  /**
   * Sends a notification message when certain members have been added to a channel.
   * @param {any[]} array - Array of added members.
   */
  sendAddAMemberMessage(array: any[]) {
    const userNames = array.map(obj => obj.user_name);
    let rest = array.length - 1;
    this.uploadService.checkForUpload();
    if (userNames.length > 2) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + userNames[0] + ' und ' + rest + ' weitere beigetreten.';
    if (userNames.length == 2) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem sind ' + userNames[0] + ' und ' + rest + ' weitere(r) beigetreten.';
    if (userNames.length == 1) this.messageService.messageText = 'ist #' + this.channelService.currentChannelData.channelName + ' beigetreten. Außerdem ist ' + userNames[0] + ' beigetreten.';
    this.messageService.newMessage();
  }

  /**
  * Closes all open dialogs.
  */
  closeDialog() {
    this.dialog.closeAll();
  }
}
