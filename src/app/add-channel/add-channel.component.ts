import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPplToChannelComponent } from '../add-ppl-to-channel/add-ppl-to-channel.component';

@Component({
  selector: 'app-add-channel',
  templateUrl: './add-channel.component.html',
  styleUrls: ['./add-channel.component.scss']
})
export class AddChannelComponent {

  constructor(public dialog: MatDialog) {
    
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  openAddPPlToChannel() {
    this.dialog.closeAll();
    this.dialog.open(AddPplToChannelComponent);
  } 
}
