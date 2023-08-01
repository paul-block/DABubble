import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})
export class DialogEditChannelComponent {
  editChannelName: string = 'Bearbeiten';
  editChannelDescription: string = 'Bearbeiten';
  editName: boolean = false;
  editDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string = 'Dieser Channel ist für alles rund um #Entwicklerteam-Thema vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';

  leaveChannel() {
    console.log('leaveFunction');
  }

  changeEditText(section) {
    this.editChannelName = 'Bearbeiten';
    this.editChannelDescription = 'Bearbeiten';

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
}
