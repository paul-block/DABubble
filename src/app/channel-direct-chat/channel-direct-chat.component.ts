import { AfterViewChecked, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogEditMembersComponent } from '../dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { DirectChatService } from 'services/directchat.service';
import { MessagesService } from 'services/messages.service';
import { EmojiService } from 'services/emoji.service';
import { Observable, Subscription } from 'rxjs';
import { doc, getFirestore, onSnapshot } from '@angular/fire/firestore';


@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})

export class ChannelDirectChatComponent{

  @Output() threadOpen = new EventEmitter<boolean>();
  db = getFirestore();
  messageCreator: boolean = false;
  toggleEditMessage: boolean = false;
  isEditChannelDialogOpen: boolean = false;
  isEditMembersDialogOpen: boolean = false;
  isAddMembersDialogOpen: boolean = false;
  @ViewChild('editChannelREF') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  @ViewChild('editMembersREF') public ElementEditMembersRef: ElementRef<HTMLDivElement>;
  @ViewChild('addMembersREF') public ElementAddMembersRef: ElementRef;
  @ViewChild('ChatContainerREF') public ElementChatContainerRef: ElementRef;
  @ViewChildren('emojiMessagePopupREF') ElementEmojiMessagePopupsRef: QueryList<ElementRef>;
  @ViewChildren('emojiPopupReactionBarREF') ElementEmojiPopupReactionBarRef: QueryList<ElementRef>;

  dialogEditChannelRef: MatDialogRef<DialogEditChannelComponent>;
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;
  dialogAddMembersRef: MatDialogRef<DialogAddMembersComponent>;

  hovered_emoji: boolean = false;
  emoji_index: number;

  constructor(
    private dialog: MatDialog,
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public dataDirectChatService: DirectChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
  ) { }

  private scrollSubscription: Subscription;

  ngOnInit(): void {
    // Auf Scroll-Benachrichtigungen vom Service hören
    this.scrollSubscription = this.msgService.scrollObservable.subscribe(() => {
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    // Abonnement aufräumen
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  scrollToBottom() {
    if (this.ElementChatContainerRef) {
      this.ElementChatContainerRef.nativeElement.scrollTop = this.ElementChatContainerRef.nativeElement.scrollHeight;
    }
  }

  editChannel() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.left}px`,
    };
    dialogConfig.panelClass = 'custom-edit-channel-dialog';

    this.dialogEditChannelRef = this.dialog.open(DialogEditChannelComponent, dialogConfig);
    this.isEditChannelDialogOpen = true;

    this.dialogEditChannelRef.afterClosed().subscribe(() => {
      this.isEditChannelDialogOpen = false;
    });
  }


  editMembers() {
    const rect = this.ElementEditMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.right - 420}px`,
    };
    dialogConfig.panelClass = 'custom-edit-members-dialog';

    this.dialogEditMembersRef = this.dialog.open(DialogEditMembersComponent, dialogConfig);
    this.isEditMembersDialogOpen = true;

    this.dialogEditMembersRef.afterClosed().subscribe((closedWithRedirection: boolean) => {
      if (closedWithRedirection) {
        this.dialogEditMembersRef = null;
        this.addMembers();
      }
      this.isEditMembersDialogOpen = false;
    });

  }


  addMembers() {
    const rect = this.ElementAddMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();

    dialogConfig.position = {
      top: `${rect.bottom}px`,
      left: `${rect.right - 520}px`,
    };
    dialogConfig.panelClass = 'custom-edit-members-dialog';

    this.dialogAddMembersRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    this.isAddMembersDialogOpen = true;

    this.dialogAddMembersRef.afterClosed().subscribe(() => {
      this.isAddMembersDialogOpen = false;
    });
  }


  resetToggledAreas() {
    this.emojiService.emojiPicker_open = false;
    this.toggleEditMessage = false;
    this.emojiService.picker_reaction_bar = false;
  }


  toggleArea(toggleArea) {
    switch (toggleArea) {
      case 'more':
        this.emojiService.emojiPicker_open = false;
        this.emojiService.picker_reaction_bar = false;
        this.toggleEditMessage = !this.toggleEditMessage;
        break;
      case 'emojis':
        this.toggleEditMessage = false;
        this.emojiService.picker_reaction_bar = false;
        this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
        break;
      case 'emojiReactionBar':
        this.toggleEditMessage = false;
        this.emojiService.emojiPicker_open = false;
        this.emojiService.picker_reaction_bar = !this.emojiService.picker_reaction_bar;
        break;
      default:
        break;
    }
  }


  isMessageCreator(user_Sender_ID) {
    const currentUserID = this.authService.userData.uid
    if (currentUserID) {
      return user_Sender_ID === currentUserID;
    } else {
      return false;
    }
  }


  addEmojiInMessage($event: any, i: number, chatMessage) {
    let chatMessages = this.dataDirectChatService.directChatMessages;
    let user = this.authService.userData.user_name;
    this.emojiService.emojiPicker_open = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }


  addOrRemoveEmojiClickEmojis(i: number, j: number, chatMessage) {
    let chatMessages = this.dataDirectChatService.directChatMessages;
    let user = this.authService.userData.user_name;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }


  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.emoji_index = j
  }


  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }


  public openThread(value: boolean) {
    this.threadOpen.emit(value)
  }


  getImageUrl(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.avatar
  }


  
}
