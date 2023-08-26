import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { Subscription } from 'rxjs';
import { NewMsgService } from 'services/new-msg.service';
import { ChannelService } from 'services/channel.service';
import { DirectChatService } from 'services/directchat.service';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

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
  private subChannels: Subscription;
  private subChats: Subscription;
  currentUserSubscription: Subscription;
  currentUser_id: any;

  constructor(
    public authService: AuthenticationService,
    public dialog: MatDialog,
    private newMsgService: NewMsgService,
    public channelService: ChannelService,
    public directChatService: DirectChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
  ) { 
 
    
  
  }

  ngAfterViewInit(): void {
    // console.log('getUid() ngAfterViewInit channel-sidebar: ' + this.authService.getUid());
  }

  async ngOnInit() {
    this.subChannels = this.channelService.authorizedChannels.subscribe(channels => {
      this.channelService.channels = channels;
    });

    this.directChatService.loadChats();
    this.subChats = this.directChatService.getUsersChatsObservable().subscribe(chat => {
      this.directChatService.chats.push(chat);
    });
    await this.authService.waitUntilAuthInitialized();
    this.currentUserSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser_id = user.uid;
      console.log(this.currentUser_id);
      
    });

    // setTimeout(() => {
    //   // console.log('getUid() ngOnInit channel-sidebar: ' + this.authService.getUid());
    //   this.directChatService.initOwnChat();
    // }, 2000);
  }

  ngOnDestroy() {
    this.subChannels.unsubscribe();
    this.subChats.unsubscribe();
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
    this.newMsgService.newMsgComponentOpen = !this.newMsgService.newMsgComponentOpen;
  }

  async searchChatAndGetMessages(userReceiverID) {
    this.directChatService.currentChatSection = 'chats';
    await this.directChatService.searchChat(userReceiverID);
    this.directChatService.textAreaMessageTo();
    this.msgService.getMessages();
    this.fsDataThreadService.thread_open = false;
  }

  checkIfSameChatID(userReceiverID) {
    return this.directChatService.currentChatID !== userReceiverID;
  }

  async openChat(chat) {
    if (this.newMsgService.newMsgComponentOpen) this.toggleNewMsgComponent();
    if (this.directChatService.currentChatID !== chat.chat_ID) {
      this.directChatService.currentChatSection = 'chats';
      this.directChatService.currentChatID = chat.chat_ID;
      this.msgService.emptyMessageText();
      try {
        this.directChatService.currentChatData = chat;
        this.directChatService.textAreaMessageTo();
        this.msgService.getMessages();
        this.fsDataThreadService.thread_open = false;
      } catch (error) {
        console.error("Fehler bei öffnen des Chats: ", error);
      }
    }
  }

  isCurrentUserChat(chat): boolean {
    return chat.chat_Member_IDs[0] === chat.chat_Member_IDs[1] ? true : false;
  }


  async openChannel(channelID) {
    if (this.newMsgService.newMsgComponentOpen) this.toggleNewMsgComponent();
    if (this.directChatService.currentChatID !== channelID) {
      this.directChatService.currentChatSection = 'channels';
      this.directChatService.currentChatID = channelID;
      this.msgService.emptyMessageText();
      try {
        this.directChatService.getCurrentChatData();
        this.directChatService.textAreaMessageTo();
        this.msgService.getMessages();
        this.fsDataThreadService.thread_open = false;
      } catch (error) {
        console.error("Fehler bei öffnen des Channels: ", error);
      }
    }
  }


}


