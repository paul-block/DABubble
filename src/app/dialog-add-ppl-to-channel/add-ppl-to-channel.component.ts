import { Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'src/services/authentication.service';
import { ChannelService } from 'src/services/channel.service';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-add-ppl-to-channel',
  templateUrl: './add-ppl-to-channel.component.html',
  styleUrls: ['./add-ppl-to-channel.component.scss']
})
export class AddPplToChannelComponent implements OnInit {
  checkboxValue = false;
  selectedOption: string;
  certainInput: string;
  channelName: string;
  public searchControl = new FormControl();
  userId: string;
  hideAutocomplete = true;


  constructor(
    public dialog: MatDialog,  
    public authService: AuthenticationService,   
    public dialogRef: MatDialogRef<AddPplToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public channelService: ChannelService,   
  ) {
    this.channelName = data.channelName; 
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(value => {
      this.authService.setSearchControlValue(value);
      console.log(value)
    });
  }  

  updateCertainInput(value: string) {
    this.certainInput = value;
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  createNewChannel() {
    this.channelService.createNewChannel(this.channelName);
    this.channelService.addUserToChannel(this.channelName, this.userId)
    this.dialog.closeAll();
  }
}
