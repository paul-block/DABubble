import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent {
  checkboxValue = false;
  selectedOption: string;
  certainInput: string;
  channelName: string;

  constructor(
    public dialog: MatDialog,  
    public authService: AuthenticationService,   
    public dialogRef: MatDialogRef<AddPplToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.channelName = data.channelName; 
  }

  updateCertainInput(value: string) {
    this.certainInput = value;
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  addChannel() {
    this.authService.addChannel(this.channelName);
    this.dialog.closeAll();
  }
}
