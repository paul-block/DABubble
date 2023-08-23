import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { DirectChatService } from 'services/directchat.service';

@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})
export class DialogEditChannelComponent implements OnInit {
  editChannelName: string = 'Bearbeiten';
  editChannelDescription: string = 'Bearbeiten';
  editName: boolean = false;
  editDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string = 'Dieser Channel ist für alles rund um #Entwicklerteam-Thema vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';
  creatorName: string = '';
  assignedUsers = [];

  constructor(
    public authService: AuthenticationService,
    public dataDirectChatService: DirectChatService,
    public channelService: ChannelService,
  ) { }

  async ngOnInit() {
    this.channelName = this.dataDirectChatService.currentChatData.channelName;
    this.channelDescription = this.dataDirectChatService.currentChatData.description;
    this.assignedUsers = this.dataDirectChatService.currentChatData.assignedUsers;
    this.getCreatorName();
  }


  getCreatorName(){
    const userData = this.authService.all_users.find(user => user.uid === this.dataDirectChatService.currentChatData.createdBy);
    this.creatorName = userData.user_name;
  }

  leaveChannel() {
    this.assignedUsers = this.arrayRemoveItem(this.assignedUsers, this.authService.getUid())
    this.saveEditChannelInfo()
  }

  arrayRemoveItem(array, value){
    return array.filter(item => item !== value);
  }

  changeEditText(section) {
    this.editChannelName = 'Bearbeiten';
    this.editChannelDescription = 'Bearbeiten';
    this.saveEditChannelInfo();
    if (section === 'name') {
      this.editName = !this.editName;
      if (this.editName) {
        this.editChannelName = 'Speichern';
      }
    } else if (section === 'description') {
      this.editDescription = !this.editDescription;
      if (this.editDescription) {
        this.editChannelDescription = 'Speichern';
      }
    }
  }

  saveEditChannelInfo(){
    if (this.editName || this.editDescription) {

      const changes = {
        channelName: this.channelName,
        description: this.channelDescription,
        assignedUsers: this.assignedUsers
      }

      this.dataDirectChatService.currentChatData.channelName = changes.channelName;
      this.dataDirectChatService.currentChatData.description = changes.description;
      this.dataDirectChatService.currentChatData.assignedUsers = changes.assignedUsers;
      
      this.channelService.updateChannelInfo(this.dataDirectChatService.currentChatData, changes);
    }
    
  }
}
