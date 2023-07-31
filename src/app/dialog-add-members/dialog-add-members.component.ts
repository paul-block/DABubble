import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent {
  // inputSearch: boolean = false;
  inputSearchUser: string = '';
  choosedUser: boolean = false;

  selectUser() {
    this.choosedUser = !this.choosedUser;
    this.inputSearchUser = '';
  }

  addNewMember() {
    console.log('newMemberAdded');
    this.choosedUser = false;
  }

  clearInputName(){
    console.log('clearInputName');
    this.choosedUser = false;
  }

  // checkSearchUserInput() {
  //   if (this.inputSearchUser === '') {
  //     this.inputSearch = false;
  //   } else {
  //     this.inputSearch = true;
  //   }
  // }
}
