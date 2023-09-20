import { AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';
import { Component, ElementRef, EventEmitter, HostListener, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { getFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
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
  @ViewChild('ChatContainerREF') public scrollContainer: ElementRef;
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
    public genFunctService: GeneralFunctionsService,
    private el: ElementRef,
    private renderer: Renderer2,
    private builder: AnimationBuilder
  ) { }



  ngOnInit(): void {
    this.scrollSubscription = this.msgService.scrollObservable.subscribe(() => {
      this.scrollDivToBottom();
    });
  }


  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }


  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: scrollContainerElement.scrollHeight,
      behavior: 'smooth'
    });
  }

  
  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const emojiPickerReactionBar = target.closest('.emojiPickerReactionBar');
    const emojiPickerDirect = target.closest('.emojiPickerDirect');
    const emojiPickerMessage = target.closest('.emojiPickerMessage');

    if (!emojiPickerReactionBar) {
      this.emojiService.picker_reaction_bar = false;
    }
    if (!emojiPickerDirect && !emojiPickerMessage) {
      this.emojiService.emojiPicker_open = false;
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.toggleEditMessage = false;
    }
  }



  togglePopup(popupVariable: string) {
    if (popupVariable === 'toggleEditMessage') {
      this[popupVariable] = !this[popupVariable];
    } else {
      this.emojiService[popupVariable] = !this.emojiService[popupVariable];
      if (this.emojiService[popupVariable]) {
        this.closeOtherPopups(popupVariable);
      }
    }
  }

  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['picker_reaction_bar', 'emojiPicker_open'];

    popupVariables.forEach(popup => {
      if (popup !== currentPopup) {
        this.emojiService[popup] = false;
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
    this.emojiService.picker_reaction_bar = false;
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


  showPlaceholder() {
    return this.chatService.directChatMessages.length === 0 && this.chatService.currentChatSection === 'chats' && this.msgService.messagesLoaded;
  }

  checkForScroll() {
    if (this.scrollContainer) {
      const divElement = this.scrollContainer.nativeElement;
      if (divElement.scrollHeight > divElement.clientHeight) return true
      else return false
    }
    else return false
  }
}
