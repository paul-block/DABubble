import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { NewMsgService } from '../new-msg.service';
import { AuthenticationService } from '../authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  channelsVisible: boolean = true;
  authorizedChannels: any[] = []; 
  dmsVisible: boolean = true;
  workspaceVisible: boolean = true;
  openNewMsg: boolean = false;
  @ViewChild('addChannel') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  addChannelRef: MatDialogRef<AddChannelComponent>;
  addChannelOpen: boolean = false;
  channels: any[] = [];
  private sub: Subscription;

  constructor(public dialog: MatDialog, private newMsgService: NewMsgService, public authService: AuthenticationService) {}

  ngOnInit() {
    this.sub = this.authService.authorizedChannels.subscribe(channels => {
      this.channels = channels;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.panelClass = 'add-channel-dialog';

    this.addChannelRef = this.dialog.open(AddChannelComponent, dialogConfig);
    this.addChannelOpen = true;

    this.addChannelRef.afterClosed().subscribe(() => {
      this.addChannelOpen = false;
    });
  }

  toggleNewMsgComponent() {
    this.newMsgService.toggleNewMsg();
  }

}
