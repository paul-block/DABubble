import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent implements OnInit {
  inputSearchUser: string = '';
  userAlreadyAdded: boolean = false;
  selectedUsers = [];
  users: any[] = [];
  filteredUsers: any
  loading: boolean = true;

  constructor(
    private authService: AuthenticationService,
    public channelService: ChannelService,
    public dialogRef: MatDialogRef<DialogAddMembersComponent>,
    public chatService: ChatService,
    public messageService: MessagesService,
    public uploadService: UploadService
  ) { }

/**
 * Initializes the component by filtering assigned users and setting them in the local state.
 * @returns {Promise<void>} - Resolves when the necessary async operations have completed.
 */
  async ngOnInit(): Promise<void> {
    this.users = await this.filterAlreadyAssignedUsers()
    this.filterUsers()
    this.loading = false;
  }

/**
 * Filters users based on the user's search input.
 * Filters out users whose names don't start with the search term.
 * Resets the filtered users list to all users if no search term is provided.
 */
  filterUsers() {
    this.userAlreadyAdded = false;
    if (this.inputSearchUser.length > 0) {
      this.filteredUsers = this.users.filter(user =>
        user.user_name.toLowerCase().startsWith(this.inputSearchUser.toLowerCase())
      );
    } else this.filteredUsers = this.users;
  }

/**
 * Selects a user to be added to a channel.
 * Only selects the user if they have not already been selected and if the search input isn't empty.
 * If the user has already been added, sets a flag (`userAlreadyAdded`) to true.
 * @param {object} user - The user object to select.
 */
  selectUser(user) {
    if (this.inputSearchUser.length > 0 && !this.selectedUsers.includes(user)) {
      this.userAlreadyAdded = false;
      this.selectedUsers.push(user);
      this.inputSearchUser = '';
    } else this.userAlreadyAdded = true;
  }

/**
 * Adds a new member to the current channel.
 * Sends a message to the channel indicating the new member.
 * Closes the dialog after adding all selected users and clears the search input.
 * @returns {Promise<void>} - Resolves when all selected users have been added and messages sent.
 */
  async addNewMember() {
    this.inputSearchUser = '';
    this.dialogRef.close();
    for (let user of this.selectedUsers) {
      await this.channelService.addUserToChannel(this.chatService.currentChatData.channelName, user.uid);
      await this.sendAddMemberMessage(user.user_name);
      this.messageService.scrollToBottom('channel');
    }
    this.selectedUsers = [];
  }

/**
 * Removes a selected user from the list of users to be added.
 * @param {object} userToRemove - The user object to remove.
 */
  removeSelectedUser(userToRemove) {
    this.selectedUsers = this.selectedUsers.filter(user => user.uid !== userToRemove.uid);
  }

/**
 * Filters out users who have already been assigned to the current channel.
 * Iterates through assigned users in the current channel and removes them from the full list of users.
 * @returns {Promise<any>} - Resolves to an array of users not assigned to the current channel.
 */
  async filterAlreadyAssignedUsers(): Promise<any> {
    let users = await this.authService.getAllUsers();
    this.channelService.currentChannelData.assignedUsers.forEach((assignedUser: any) => {
      let user = users.find(element => element.uid === assignedUser)
      let index = users.indexOf(user)
      users.splice(index, 1)
    });
    return users
  }

/**
 * Sends a system message to the channel, indicating that a new member has joined.
 * Before sending the message, checks for any attachments to upload.
 * Sets the message text to indicate the new member and the channel they've joined.
 * @param {string} user - The name of the user who has joined.
 * @returns {Promise<void>} - Resolves when the message has been sent.
 */
  async sendAddMemberMessage(user: string) {
    await this.uploadService.checkForUpload()
    this.messageService.messageText = user + ' ist #' + this.channelService.currentChannelData.channelName + ' beigetreten.'
    await this.messageService.newMessage()
  }
}
