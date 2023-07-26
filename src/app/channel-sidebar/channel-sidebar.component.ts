import { Component } from '@angular/core';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent {
  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  workspaceVisible: boolean = true;

  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }

  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }
}
