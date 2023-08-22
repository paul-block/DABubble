import { Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
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
  description: string;
  public searchControl = new FormControl();
  userId: string;
  hideAutocomplete = true;
  userSelected = false;
  DelevoperTeamChannelRef = 'JfMlkcJbW8ICZtQDoUTF';

  selectedUserNames: string[] = [];



  constructor(
    public dialog: MatDialog,  
    public authService: AuthenticationService,   
    public dialogRef: MatDialogRef<AddPplToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public channelService: ChannelService,   
  ) {
    this.channelName = data.channelName; 
    this.description = data.description;
  }

  ngOnInit(): void {
    this.authService.addCertainUserValue.subscribe(value => {
      this.searchControl.setValue(value, { emitEvent: false }); 
  });
    this.searchControl.valueChanges.subscribe(inputValue => {
      this.authService.updateCertainUserValue(inputValue);
      console.log(inputValue)
    });
    this.channelService.currentUserId.subscribe(userId => {
      this.userId = userId;
    });
    this.channelService.userSelected$.subscribe(
      userName => {
        this.selectedUserNames.push(userName);
      }
    );
  }  

  removeUserName(name: string) {
    const index = this.selectedUserNames.indexOf(name);
    if (index > -1) {
        this.selectedUserNames.splice(index, 1);
    }
  }

  deleteSelectedUser(userName: string) {
    this.removeUserName(userName);
    this.authService.updateCertainUserValue('');
    this.channelService.showSelectedUser(false);
    this.channelService.toggleAutocomplete(true);
  }

  closeDialog() {
    this.dialog.closeAll();
  } 

  async createNewChannel() {
    this.channelService.createNewChannel(this.channelName, this.description);

    if (this.selectedOption === 'all') {
      const members = await this.channelService.getAllMembersOfCertainChannel(this.DelevoperTeamChannelRef);
      members.forEach( member => {
        this.channelService.addUserToChannel(this.channelName, member);
      })
    } else if (this.selectedOption === 'certain' &&this.certainInput && this.certainInput.length > 0) {
    this.channelService.addUserToChannel(this.channelName, this.userId)
    }
    this.channelService.showSelectedUser(false); 
    this.channelService.toggleAutocomplete(true);
    this.dialog.closeAll();
  }
}
