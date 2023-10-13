import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { ProfileService } from 'services/profile.service';

@Component({
  selector: 'app-dialog-edit-members',
  templateUrl: './dialog-edit-members.component.html',
  styleUrls: ['./dialog-edit-members.component.scss']
})
export class DialogEditMembersComponent {
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;

  constructor(
    public chatService: ChatService,
    public authService: AuthenticationService,
    private dialogRef: MatDialogRef<DialogEditMembersComponent>,
    public profileService: ProfileService,
    public channelService: ChannelService
  ) { }

/**
 * Closes the dialog for adding a member and triggers any further 
 * processes listening for this dialog's closure with a positive response.
 */
  closeRedirectAddMember() {
    this.dialogRef.close(true);
  }
}
