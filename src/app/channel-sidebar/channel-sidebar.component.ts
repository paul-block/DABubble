import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { Subscription } from 'rxjs';
import { NewMsgService } from 'services/new-msg.service';
import { ChannelService } from 'services/channel.service';
import { DirectChatService } from 'services/directchat.service';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy, AfterViewInit {
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

  constructor(
    public dialog: MatDialog,
    private newMsgService: NewMsgService,
    public channelService: ChannelService,
    public directChatService: DirectChatService,
    public msgService: MessagesService,
    public authService: AuthenticationService
  ) {}

  ngAfterViewInit(): void {
    // console.log(this.authService.userData);
    // this.searchChatAndGetMessages(this.authService.userData.user_name);
    
    
  }

  ngOnInit() {
    this.sub = this.channelService.authorizedChannels.subscribe(channels => {
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

  async searchChatAndGetMessages(userReceiverID) {
    await this.directChatService.searchChat(userReceiverID);
    this.directChatService.textAreaMessageTo();
    this.msgService.getMessages();
  }


}


