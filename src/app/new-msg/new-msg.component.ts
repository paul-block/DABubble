import { Component } from '@angular/core';
import { NewMsgService } from 'services/new-msg.service';


@Component({
  selector: 'app-new-msg',
  templateUrl: './new-msg.component.html',
  styleUrls: ['./new-msg.component.scss']
})
export class NewMsgComponent {

  inputValue:string;

    constructor(public newMsgService:NewMsgService) {
     if (this.newMsgService.directedFromProfileButton) {
       this.inputValue = '@' + this.newMsgService.user_name;
      }
      else this.inputValue = ''
    }
  }
