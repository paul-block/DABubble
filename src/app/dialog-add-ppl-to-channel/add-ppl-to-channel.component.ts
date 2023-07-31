import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent {
  checkboxValue = false;
  selectedOption: string;
  certainInput: string;


  constructor(public dialog: MatDialog) {
    
  }

  updateCertainInput(value: string) {
    this.certainInput = value;
  }

  closeDialog() {
    this.dialog.closeAll();
  } 
}
