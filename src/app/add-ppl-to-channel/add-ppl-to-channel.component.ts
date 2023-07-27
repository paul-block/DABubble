import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent {
  checkboxValue = false;

  constructor(public dialog: MatDialog) {
    
  }

  closeDialog() {
    this.dialog.closeAll();
  } 
}
