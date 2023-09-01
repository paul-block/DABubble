import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { switchMap } from 'rxjs/operators';
import { NewMsgService } from 'services/new-msg.service';
import { AddPplToChannelComponent } from 'app/dialog-add-ppl-to-channel/add-ppl-to-channel.component';

@Component({
  selector: 'app-dialog-autocomplete',
  templateUrl: './dialog-autocomplete.component.html',
  styleUrls: ['./dialog-autocomplete.component.scss']
})
export class DialogAutocompleteComponent implements OnInit {
  filteredUsers: any[] = [];


  constructor(private authService: AuthenticationService, public channelService: ChannelService, public newMsgService: NewMsgService, public parentComponent: AddPplToChannelComponent) { }

  ngOnInit() {
    this.authService.addCertainUserValue
      .pipe(
        switchMap(value => this.filterUsers(value))
      )
      .subscribe(users => {
        this.filteredUsers = users;
        console.log(users);

      });
  }

  addUser(uid: string, userName: string) {
    this.getUserId(uid);
    this.channelService.showSelectedUser(true);
    this.channelService.selectUser(userName);
    this.channelService.selectAvatar(this.getAvatarImg(uid))
    this.authService.updateCertainUserValue('');
    // this.channelService.toggleAutocomplete(false);
    // this.authService.updateCertainUserValue(userName);
  }

  getUserId(uid: string) {
    this.channelService.getUserId(uid);
  }

  getAvatarImg(uid: string) {
    let user = this.authService.all_users.find(user => user.uid === uid);
    return user.avatar
  }


  async getFilterArray() {
    const users = await this.authService.usersWithoutCurrentuser();
    this.parentComponent.selectedUserNames.forEach(element => {
      const userIndex = users.findIndex(user => user.user_name === element);
      if (userIndex !== -1) users.splice(userIndex, 1);
    });
    return users
  }

  async filterUsers(name: string): Promise<any[]> {
    const users = await this.getFilterArray();
    const filteredUser = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUser;
  }
}
