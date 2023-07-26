import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChannelComponent } from '../add-channel/add-channel.component';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent {
  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  workspaceVisible: boolean = true;

  constructor(public dialog: MatDialog) {
    
  }

  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }

  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  openAddChannel() {
    this.dialog.open(AddChannelComponent);
  } 
}
