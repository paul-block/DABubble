import { Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '../authentication.service';
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
  searchControl = new FormControl();
  userId: string;

  constructor(
    public dialog: MatDialog,  
    public authService: AuthenticationService,   
    public dialogRef: MatDialogRef<AddPplToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.channelName = data.channelName; 
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
    .pipe(
      debounceTime(400)
    )
    .subscribe(value => {
      if (value) {
        this.authService.findUserByName(value).then(uid => {
          if (uid) {
            console.log(`User ID gefunden: ${uid}`);
            this.userId = uid;
          } else {
            console.log('Kein Benutzer gefunden');
            console.log(value, this.userId)
          }
        });
      }
    });
  }

  updateCertainInput(value: string) {
    this.certainInput = value;
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  createNewChannel() {
    this.authService.createNewChannel(this.channelName);
    this.authService.addUserToChannel(this.channelName, this.userId)
    this.dialog.closeAll();
  }
}
