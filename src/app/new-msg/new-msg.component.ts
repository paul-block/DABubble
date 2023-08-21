import { Component } from '@angular/core';
import { NewMsgService } from 'services/new-msg.service';
import { ChannelService } from 'services/channel.service';
import { AuthenticationService } from 'services/authentication.service';

@Component({
  selector: 'app-new-msg',
  templateUrl: './new-msg.component.html',
  styleUrls: ['./new-msg.component.scss']
})
export class NewMsgComponent {

  inputValue:string;
  filteredUsersByName = [];
  filteredUsersByEmail = [];
  authorizedChannels = [];
  filteredChannels = [];
  selectedValue: string;
  uid: string;


    constructor(public newMsgService:NewMsgService, public authService: AuthenticationService, public channelService: ChannelService) {
   
      this.uid = this.authService.getUid();
    
   
      if (this.newMsgService.directedFromProfileButton) {
       this.inputValue = '@' + this.newMsgService.user_name;
      }
      else this.inputValue = ''
    }

    async valueChange(value: string) {
      this.filteredUsersByName = [];
      this.filteredUsersByEmail = [];
      this.filteredChannels = [];
  

    console.log(this.uid);
     this.filteredUsersByName = await this.authService.filterUsers(value);
     this.filteredUsersByEmail = await this.authService.filterUsersByEmail(value);
     this.authorizedChannels = await this.channelService.getChannels(this.uid);
     console.log(this.filteredChannels)
     this.filteredChannels = this.authorizedChannels.filter(channel => channel.channelName.toLowerCase().startsWith(value.toLowerCase())
    );
    }

    selectValue(event: Event, category: string, uid?) {
      const clickedValue = ((event.currentTarget as HTMLElement).querySelector('span:not(.tag)') as HTMLElement).innerText;
      
      if (uid) this.newMsgService.user_id = uid;
      if (category == 'userName') this.inputValue = '@' + clickedValue;
      if (category == 'userEmail') this.inputValue = clickedValue;
      if (category == 'channel') this.inputValue = '#' + clickedValue;
      
      this.selectedValue = clickedValue;
    
        this.filteredUsersByName = [];
        this.filteredUsersByEmail = [];
        this.filteredChannels = [];
    }
    
    }


  