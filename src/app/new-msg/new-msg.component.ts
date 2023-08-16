import { Component } from '@angular/core';
import { NewMsgService } from 'src/services/new-msg.service';


@Component({
  selector: 'app-new-msg',
  templateUrl: './new-msg.component.html',
  styleUrls: ['./new-msg.component.scss']
})
export class NewMsgComponent {

  inputValue:string;

    constructor(public newMsgService:NewMsgService) {
      if (this.newMsgService.directedFromProfileButton) {
        this.inputValue = 'An: ' + this.newMsgService.user_name;
      }
    }

    


}
