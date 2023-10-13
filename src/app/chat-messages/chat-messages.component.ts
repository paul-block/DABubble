import { Component, ElementRef, EventEmitter, HostListener, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  private mutationObserver: MutationObserver;
  isScrollable: boolean = false;

  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public reactionBubbleService: ReactionBubbleService,
    public profileService: ProfileService,
    public uploadService: UploadService,
    public genFunctService: GeneralFunctionsService,
  ) { }

/**
  * OnInit lifecycle hook: initializes the scroll subscription for new messages.
  */
  ngOnInit(): void {
    this.scrollSubscription = this.msgService.scrollObservable.subscribe(() => {
      this.scrollDivToBottom();
    });
  }

/**
 * AfterViewInit lifecycle hook: sets up observation on changes to the chat's scroll container.
 */
  ngAfterViewInit() {
    this.observeDivChanges();
  }

/**
 * OnDestroy lifecycle hook: cleans up the scroll subscription and disconnects the mutation observer.
 */
ngOnDestroy(): void {
  if (this.scrollSubscription) {
    this.scrollSubscription.unsubscribe();
  }
  if (this.mutationObserver) {
    this.mutationObserver.disconnect();
  }
}

/**
 * Listens for a click event on the document and performs various checks and logic based on the target clicked.
 * @param {Event} event - The triggered click event.
 */
@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const target = event.target as HTMLElement;
  const emojiPickerReactionBar = target.closest('.emojiPickerReactionBar');
  const emojiPickerDirect = target.closest('.emojiPickerDirect');
  const emojiPickerMessage = target.closest('.emojiPickerMessage');
  const emojiPickerMessageEdit = target.closest('.emojiPickerMessageEdit');
  const toggleEditMessage = target.closest('.toggleEditMessage');
  if (!emojiPickerReactionBar) this.emojiService.picker_reaction_bar = false;
  if (!emojiPickerDirect && !emojiPickerMessage && !emojiPickerMessageEdit) this.emojiService.emojiPicker_open = false;
  if (!toggleEditMessage) this.toggleEditMessage = false;
}

/**
 * Sets up a MutationObserver to track changes in the chat's scroll container and trigger the check for scroll.
 */
  private observeDivChanges() {
    if (this.scrollContainer) {
      const nativeElement = this.scrollContainer.nativeElement;
      const observerConfig = { childList: true, subtree: true };
      this.mutationObserver = new MutationObserver(() => {
        this.checkForScroll();
      });
      this.mutationObserver.observe(nativeElement, observerConfig);
    }
  }

/**
 * Checks if the chat container is scrollable and updates the `isScrollable` state accordingly.
 */
  checkForScroll() {
    if (this.scrollContainer) {
      const nativeElement = this.scrollContainer.nativeElement;
      const isScrollable = nativeElement.scrollHeight > nativeElement.clientHeight;
      if (this.isScrollable !== isScrollable) {
        this.isScrollable = isScrollable;
      }
    } else {
      this.isScrollable = false;
    }
  }

/**
 * Scrolls the chat container to its bottom-most position.
 */
  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: scrollContainerElement.scrollHeight,
      behavior: 'smooth'
    });
  }

/**
 * Scrolls the chat container to its top-most position.
 */
  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

/**
 * Toggles the visibility of the specified popup.
 * @param {string} popupVariable - The name of the variable controlling the visibility of the popup.
 */
  togglePopup(popupVariable: string) {
    popupVariable === 'toggleEditMessage' ? this.toggleLocalVar() : this.toggleServiceVar(popupVariable);
  }

/**
 * Toggles the `toggleEditMessage` variable to show or hide the message editing interface.
 */
  toggleLocalVar() {
    this.toggleEditMessage = !this.toggleEditMessage;
  }

/**
 * Toggles a specified popup variable from the `emojiService` service.
 * @param {string} popupVariable - The name of the variable to be toggled.
 */
  toggleServiceVar(popupVariable) {
    this.emojiService[popupVariable] = !this.emojiService[popupVariable];
    if (this.emojiService[popupVariable]) this.closeOtherPopups(popupVariable);
  }

/**
 * Closes any popups that are open, except the one specified.
 * @param {string} currentPopup - The name of the popup that should remain open.
 */
  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['picker_reaction_bar', 'emojiPicker_open'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) this.emojiService[popup] = false;
    });
  }

/**
 * Checks if the logged-in user is the creator of a specified message.
 * @param {string} user_Sender_ID - The sender ID of the message.
 * @returns {boolean} - True if the logged-in user is the message's creator, false otherwise.
 */
  isMessageCreator(user_Sender_ID) {
    const currentUserID = this.authService.userData.uid
    if (currentUserID) {
      return user_Sender_ID === currentUserID;
    } else {
      return false;
    }
  }

/**
 * Adds an emoji reaction to a chat message.
 * @param {any} $event - The emoji event data.
 * @param {number} i - The index of the chat message.
 * @param {object} chatMessage - The chat message data.
 */
  addEmojiInMessage($event: any, i: number, chatMessage) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiService.emojiPicker_open = false;
    this.emojiService.picker_reaction_bar = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }

/**
 * Adds or removes an emoji reaction to/from a chat message based on user interaction.
 * @param {number} i - The index of the chat message.
 * @param {number} j - The index of the emoji reaction.
 * @param {object} chatMessage - The chat message data.
 */
  addOrRemoveEmojiClickEmojis(i: number, j: number, chatMessage) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }

/**
 * Shows users who have reacted with a specified emoji.
 * @param {number} i - The index of the chat message.
 * @param {number} j - The index of the emoji reaction.
 */
  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.emoji_index = j
  }

/**
 * Closes the user list for an emoji reaction.
 */
  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }

/**
 * Emits an event to open a chat thread.
 * @param {boolean} value - The status to set for the chat thread.
 */
  public openThread(value: boolean) {
    this.threadOpen.emit(value)
  }

/**
 * Determines if a placeholder message should be shown in the chat container.
 * @returns {boolean} - True if a placeholder message should be displayed, false otherwise.
 */
  showPlaceholder() {
    return this.chatService.directChatMessages.length === 0 && this.chatService.currentChatSection === 'chats' && this.msgService.messagesLoaded;
  }
}
