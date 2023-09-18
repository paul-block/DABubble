import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { Subscription } from 'rxjs';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { getAuth } from 'firebase/auth';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {

  auth = getAuth();
  @ViewChild('addChannel') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  addChannelRef: MatDialogRef<AddChannelComponent>;
  addChannelOpen: boolean = false;

  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  openNewMsg: boolean = false;

  private newChannelIdSubscription: Subscription;

  currentChannelId: string;


  constructor(
    public authService: AuthenticationService,
    public dialog: MatDialog,
    public channelService: ChannelService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
  ) {
    this.newChannelIdSubscription = this.channelService.createdChannelId$.subscribe((newId) => {
      this.currentChannelId = newId;
      if (this.currentChannelId) this.openChat(this.currentChannelId, 'channels');
    });
  }


  async ngOnInit() {
    await this.authService.waitUntilAuthInitialized();
    this.chatService.currentUser_id = this.auth.currentUser.uid
    await this.authService.usersPromise;
    await this.chatService.loadChats();
    await this.chatService.initOwnChat();
  }


  ngOnDestroy() {
    if (this.newChannelIdSubscription) this.newChannelIdSubscription.unsubscribe();
  }


  async openChat(id: string, chatSection: string) {
    this.ensureChatSectionVisible();
    if (this.chatService.currentChatID !== id) {
      this.chatService.currentChatSection = chatSection;
      this.setCurrentID(id);
      try {
        await this.getCurrentData();
        console.log('test');


        this.msgService.scrollToBottom()

      } catch (error) {
        console.error("Fehler bei öffnen des Channels: ", error);
      }
    }
  }


  sendNewMsg() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true
    this.msgService.emptyMessageText();
    this.toggleNewMsgComponent();
  }


  openAddChannelDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'add-channel-dialog';
    this.addChannelRef = this.dialog.open(AddChannelComponent, dialogConfig);
    this.addChannelOpen = true;
    this.addChannelRef.afterClosed().subscribe(() => {
      this.addChannelOpen = false;
    });
  }


  checkChangeToMobileLogo() {
    if (window.innerWidth <= 1000) {
      this.genFunctService.changeMobileLogo = true;
    }
  }


  setCurrentID(id: string) {
    this.chatService.currentChatID = id;
    if (this.chatService.currentChatSection == 'channels') this.channelService.currentChannelID = id;
    this.msgService.emptyMessageText();
  }


  async getCurrentData() {
    this.chatService.getCurrentChatData();
    this.chatService.textAreaMessageTo();
    if (this.chatService.currentChatSection == 'channels') this.channelService.loadCurrentChannel();
    this.msgService.getMessages().then(() => {
      this.chatService.thread_open = false;
      this.msgService.scrollToBottom()
    });
  }


  ensureChatSectionVisible() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true
    if (this.chatService.openNewMsgComponent) this.toggleNewMsgComponent();
  }


  toggleNewMsgComponent() {
    this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
  }


  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }


  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }


  checkIfSameChatID(userReceiverID: string) {
    return this.chatService.currentChatID !== userReceiverID;
  }


  isCurrentUserChat(chat: { chat_Member_IDs: any[]; }): boolean {
    return chat.chat_Member_IDs[0] === chat.chat_Member_IDs[1] ? true : false;
  }

}


