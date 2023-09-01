import { Component, ElementRef, EventEmitter, HostListener, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { getFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { MessagesService } from 'services/messages.service';
import { ProfileService } from 'services/profile.service';
import { ReactionBubbleService } from 'services/reaction-bubble.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss']
})

export class ChatMessagesComponent {
  db = getFirestore();
  @Output() threadOpen = new EventEmitter<boolean>();
  messageCreator: boolean = false;
  toggleEditMessage: boolean = false;
  emojiPicker_open: boolean = false;
  picker_reaction_bar: boolean = false;
  @ViewChild('ChatContainerREF') public ElementChatContainerRef: ElementRef;
  @ViewChildren('emojiMessagePopupREF') ElementEmojiMessagePopupsRef: QueryList<ElementRef>;
  @ViewChildren('emojiPopupReactionBarREF') ElementEmojiPopupReactionBarRef: QueryList<ElementRef>;
  private scrollSubscription: Subscription;
  hovered_emoji: boolean = false;
  emoji_index: number;

  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public reactionBubbleService: ReactionBubbleService,
    public profileService: ProfileService,
    public uploadService: UploadService,
    private elementRef: ElementRef,
  ) { }



  ngOnInit(): void {
    this.scrollSubscription = this.msgService.scrollObservable.subscribe(() => {
      this.scrollToBottom();
    });
  }


  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }


  scrollToBottom() {
    if (this.ElementChatContainerRef) {
      this.ElementChatContainerRef.nativeElement.scrollTop = this.ElementChatContainerRef.nativeElement.scrollHeight;
    }
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.toggleEditMessage = false;
      this.emojiService.picker_reaction_bar = false;
      if (this.emojiService.picker_index === -2) {
        this.emojiPicker_open = false;
      }

    }
  }


  togglePopup(popupVariable: string) {
    this[popupVariable] = !this[popupVariable];
    if (this[popupVariable]) {
      this.closeOtherPopups(popupVariable);
    }
    this.emojiService.emojiPicker_open = this.emojiPicker_open;
    this.emojiService.picker_reaction_bar = this.picker_reaction_bar;
  }


  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['picker_reaction_bar', 'toggleEditMessage', 'emojiPicker_open'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) {
        this[popup] = false;
      }
    });
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
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiService.emojiPicker_open = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
    console.log(this.msgService.emoji_data);

  }


  addOrRemoveEmojiClickEmojis(i: number, j: number, chatMessage) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
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
}
