import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPplToChannelComponent } from '../dialog-add-ppl-to-channel/add-ppl-to-channel.component';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-channel',
  templateUrl: './add-channel.component.html',
  styleUrls: ['./add-channel.component.scss']
})
export class AddChannelComponent {
  form = new FormGroup({
    'channel-name': new FormControl(''),
    'description': new FormControl('')
  });

  constructor(public dialog: MatDialog) {
    
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  openAddPPlToChannel() {
    const channelName = this.form.controls['channel-name'].value;
    const description = this.form.controls['description'].value;
    this.dialog.closeAll();

    const dialogRef = this.dialog.open(AddPplToChannelComponent, {
      data: { channelName: channelName, description: description }, 
    });
  
  }
  
}
