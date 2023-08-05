import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthenticationService } from 'src/services/authentication.service';
import { AddPplToChannelComponent } from '../dialog-add-ppl-to-channel/add-ppl-to-channel.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-autocomplete',
  templateUrl: './dialog-autocomplete.component.html',
  styleUrls: ['./dialog-autocomplete.component.scss']
})
export class DialogAutocompleteComponent implements OnInit  {
  userNameControl = new FormControl();
  filteredUsers: any[] = [];

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    
    this.authService.searchControlValue
    .pipe(
      switchMap(value => this.authService.filterUsers(value))
    )
    .subscribe(users => {
      this.filteredUsers = users;
    });
  }

}
