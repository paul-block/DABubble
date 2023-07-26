import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
}
