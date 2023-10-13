import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogAddMembersComponent } from 'app/dialog-add-members/dialog-add-members.component';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { MessagesService } from 'services/messages.service';
import { ProfileService } from 'services/profile.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})
export class DialogEditChannelComponent implements OnInit {
  editChannelName: string = 'Bearbeiten';
  editChannelDescription: string = 'Bearbeiten';
  editChannelNameMobile: string = 'edit';
  editChannelDescriptionMobile: string = 'edit';
  editChannelUsers: boolean = false;
  editName: boolean = false;
  editDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string = 'Dieser Channel ist für alles rund um #Entwicklerteam-Thema vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';
  creatorName: string = '';
  assignedUsers = [];
  delete_Channel: boolean = false
  leave_Channel: boolean = false;
  windowWidth: number;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public channelService: ChannelService,
    public uploadService: UploadService,
    public messageService: MessagesService,
    public profileService: ProfileService,
    public genFunctService: GeneralFunctionsService,
    private dialogRef: MatDialogRef<DialogAddMembersComponent>,
  ) { }

/**
 * Initializes the component with necessary data.
 * Fetches the channel details and assigned users from the chat service.
 */
  async ngOnInit() {
    this.channelName = this.chatService.currentChatData.channelName;
    this.channelDescription = this.chatService.currentChatData.description;
    this.assignedUsers = this.chatService.currentChatData.assignedUsers;
    this.getCreatorName();
  }

/**
 * Event listener for window resizing.
 * Checks the width of the window and determines if the application is being viewed on a mobile screen.
 * @param {any} event - The event data containing window size details.
 */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
    if (this.windowWidth > 1000) {
      this.genFunctService.isMobileScreen = false;
    } else {
      this.genFunctService.isMobileScreen = true;
    }
  }

/**
 * Retrieves the creator's name of the current chat based on the user ID.
 */
  getCreatorName() {
    const userData = this.authService.all_users.find(user => user.uid === this.chatService.currentChatData.createdBy);
    this.creatorName = userData.user_name;
  }

/**
 * Toggles the visibility of the "Leave Channel" confirmation text.
 */
  toggleLeaveText() {
    this.leave_Channel = !this.leave_Channel;
  }

/**
 * Allows the current user to leave the channel and updates the chat section.
 */
  async leaveChannel() {
    if (this.assignedUsers.includes(this.authService.userData.uid)) {
      await this.sendLeaveMessage()
      this.editChannelUsers = !this.editChannelUsers;
      this.assignedUsers = this.arrayRemoveItem(this.assignedUsers, this.authService.userData.uid);
      this.saveEditChannelInfo()
      this.chatService.currentChatSection = 'noChatSectionSelected';
      this.chatService.currentChatID = 'noChatSelected';
    }
  }

/**
 * Removes a specified value from an array.
 * @param {Array} array - The array to remove an item from.
 * @param {any} value - The value to be removed from the array.
 * @returns {Array} - The array after removal of the specified item.
 */
  arrayRemoveItem(array, value) {
    return array.filter(item => item !== value);
  }

/**
 * Handles changes in the channel information, based on the edited section.
 * @param {string} section - The section that has been edited.
 */
  changeEditText(section) {
    this.saveEditChannelInfo();
    if (section === 'name') {
      this.toggleChannelEditSafe('editName', 'editChannelName', 'editChannelNameMobile')
    } else if (section === 'description') {
      this.toggleChannelEditSafe('editDescription', 'editChannelDescription', 'editChannelDescriptionMobile')
    }
  }

/**
 * Toggles the display mode between editing and viewing for the channel's properties.
 * This also updates the UI elements accordingly based on the current display mode.
 * @param {string} sectionVar - The property indicating if the section is in edit mode.
 * @param {string} sectionEditSafe - The label to display for the desktop view toggle button.
 * @param {string} sectionEditSafeMobile - The icon to display for the mobile view toggle button.
 */
  toggleChannelEditSafe(sectionVar, sectionEditSafe, sectionEditSafeMobile) {
    this[sectionVar] = !this[sectionVar];
    if (this[sectionVar]) {
      this[sectionEditSafe] = 'Speichern';
      this[sectionEditSafeMobile] = 'check_circle'
    } else {
      this[sectionEditSafe] = 'Bearbeiten';
      this[sectionEditSafeMobile] = 'edit'
    }
  }

/**
 * Saves the modifications made to the channel's information.
 */
  saveEditChannelInfo() {
    if (this.editName || this.editDescription || this.editChannelUsers) {
      const changes = this.getChannelChanges();
      this.applyChannelChanges(changes);
      this.channelService.updateChannelInfo(this.chatService.currentChatData, changes);
    }
  }

/**
 * Extracts the updated properties of the channel.
 * @returns {Object} - An object containing the updated channel properties.
 */
  getChannelChanges() {
    return {
      channelName: this.channelName,
      description: this.channelDescription,
      assignedUsers: this.assignedUsers
    }
  }

/**
 * Applies the provided modifications to the current chat data.
 * @param {Object} changes - An object containing the updated channel properties.
 */
  applyChannelChanges(changes) {
    this.chatService.currentChatData.channelName = changes.channelName;
    this.chatService.currentChatData.description = changes.description;
    this.chatService.currentChatData.assignedUsers = changes.assignedUsers;
  }

/**
 * Deletes the current channel and updates the user's view to indicate no channel is selected.
 */
  async deleteChannel() {
    this.channelService.deleteChannel(this.chatService.currentChatData.channel_ID);
    this.chatService.currentChatSection = 'noChatSectionSelected';
  }

/**
 * Toggles the display of the channel deletion confirmation text.
 */
  openDeleteText() {
    this.delete_Channel = !this.delete_Channel;
  }

/**
 * Cancels the channel deletion process by hiding the deletion confirmation text.
 */
  abortDelete() {
    this.delete_Channel = !this.delete_Channel;
  }

/**
 * Sends a notification message to the channel, indicating that the user has left.
 */
  async sendLeaveMessage() {
    this.uploadService.checkForUpload();
    this.messageService.messageText = this.authService.userData.user_name + ' hat #' + this.channelService.currentChannelData.channelName + ' verlassen.';
    await this.messageService.newMessage();
  }

/**
 * Closes the dialog used for adding members, indicating that members were added successfully.
 */
  closeRedirectAddMember() {
    this.dialogRef.close(true);
  }
}
