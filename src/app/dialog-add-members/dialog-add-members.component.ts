import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent {
  inputSearch: boolean = false;
  inputSearchPeople: string = '';

  checkSearchPeopleInput() {
    if (this.inputSearchPeople === '') {
      this.inputSearch = false;
    } else {
      this.inputSearch = true;
    }
  }
}
