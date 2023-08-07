import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/services/authentication.service';
import { ChannelService } from 'src/services/channel.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-autocomplete',
  templateUrl: './dialog-autocomplete.component.html',
  styleUrls: ['./dialog-autocomplete.component.scss']
})
export class DialogAutocompleteComponent implements OnInit  {
  // kann wahrscheinlich weg 
  userNameControl = new FormControl();

  filteredUsers: any[] = [];


  constructor(private authService: AuthenticationService, private channelService: ChannelService) { }

  ngOnInit() {
    // this.authService.addCertainUserValue
    // .pipe(
    //   switchMap(value => this.authService.filterUsers(value))
    // )
    // .subscribe(users => {
    //   this.filteredUsers = users;
    // });
  }

  // addUser(uid: string, userName: string) {
  //   this.getUserId(uid);
  //   this.channelService.selectUser(userName);
  // }

  // getUserId(uid: string) {
  //   this.channelService.getUserId(uid);
  //   console.log(uid)
  // }

}
