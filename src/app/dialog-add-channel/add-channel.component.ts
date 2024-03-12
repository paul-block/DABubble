import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddPplToChannelComponent } from '../dialog-add-ppl-to-channel/add-ppl-to-channel.component';
import { ChannelService } from 'services/channel.service';

@Component({
  selector: 'app-add-channel',
  templateUrl: './add-channel.component.html',
  styleUrls: ['./add-channel.component.scss']
})
export class AddChannelComponent {
  error: boolean = false;
  channelName: string = '';
  description: string = '';
  inputIsEmpty: boolean = true;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService
  ) { }

  /**
  * This method first retrieves the channel name and description from the form, 
  * configures the dialog's properties, and then 
  * initializes the dialog. It also sets listeners for when the dialog is closed.
  */
  openAddPplToChannel() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '710px';
    dialogConfig.panelClass = 'dialog-add-people';
    dialogConfig.data = { channelName: this.channelName, description: this.description };
    this.dialog.closeAll();
    this.dialog.open(AddPplToChannelComponent, dialogConfig);
  }

  /**
  * Checks if the provided channel name already exists. If it doesn't, 
  * it opens the "Add People to Channel" dialog. If it does, toggles the error state.
  */
  checkIfChannelNameExist() {
    const channelName = this.channelService.channels.find(channel => channel.channelName === this.channelName);
    if (!channelName) this.openAddPplToChannel();
    else this.error = !this.error;
  }

  /**
  * Closes all open dialogs.
  */
  closeDialog() {
    this.dialog.closeAll();
  }
}
