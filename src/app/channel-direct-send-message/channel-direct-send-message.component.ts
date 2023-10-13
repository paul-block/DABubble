import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';
import { AuthenticationService } from 'services/authentication.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {
  @Input() inputValue: string;
  @Input() selectedValue?: string;
  open_attachment_menu: boolean = false;
  open_users: boolean = false;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public fsDataThreadService: FirestoreThreadDataService,
    public uploadService: UploadService,
    public genFService: GeneralFunctionsService,
    private elementRef: ElementRef
  ) { }

  /**
  * Listens to click events on the entire document.
  * If the clicked element is outside the current component, it closes any open menus or user lists.
  * @param {Event} event - The browser click event.
  */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open_attachment_menu = false;
      this.open_users = false;
    }
  }

  /**
   * Toggles the visibility of a given popup component based on the provided popup variable.
   * Can also trigger additional actions, like fetching users or triggering the emoji picker.
   * @param {string} popupVariable - The name of the popup state variable.
   */
  togglePopup(popupVariable: string) {
    if (popupVariable === 'emojiPicker_open') {
      this.toggleEmojiPicker()
    } else {
      this[popupVariable] = !this[popupVariable];
      this.closeOtherPopups(popupVariable);
      this.uploadService.chat_section = 'channel'
    }
    if (popupVariable === 'open_users') {
      this.getAllUsers()
    }
  }

  /**
   * Toggles the visibility of the emoji picker.
   */
  toggleEmojiPicker() {
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
  }

  /**
   * Closes other popups, excluding the one specified by the provided popup variable.
   * @param {string} currentPopup - The name of the popup state variable that should remain open.
   */
  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['open_attachment_menu', 'open_users'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) {
        this[popup] = false;
      }
    });
  }

  /**
   * Adds an emoji to the textarea and updates the message text.
   * Also checks if the message is empty afterward.
   * @param {any} $event - The event object associated with the emoji selection.
   */
  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText += this.emojiService.textMessage;
    this.emojiService.textMessage = '';
    this.msgService.checkIfEmpty();
  }

  /**
  * Handles the send message action, validating conditions and preparing the message for sending.
  * The function manages various conditions including checking if there's a message or file ready to send,
  * and if the new message component is open.
  */
  public async onSendClick() {    
    if (!this.validateNewMessageComponentConditions()) {
      return;
    }
    if (this.textMessageNotEmpty()|| this.fileReadyForUpload()) {
      if (this.chatService.openNewMsgComponent) {
        this.toggleOpenNewMsgComponent();
        this.chatService.currentChatSection = 'chats';
        this.messagePreperation();
        this.chatService.userReceiverName = '';
      } else {
        this.messagePreperation();
      }
    }
  }

  /**
   * Validates the conditions for the new message component before sending a message.
   * If a user hasn't been selected (`selectedValue` is undefined) and the new message 
   * component is open, it highlights the input field and returns false, indicating the message 
   * shouldn't be sent. Otherwise, it returns true.
   * @returns {boolean} - True if conditions to send the message are met, otherwise false.
   */
  validateNewMessageComponentConditions(): boolean {
    if (this.selectedValue === undefined && this.chatService.openNewMsgComponent) {
        this.genFService.highlightInput.next(true);
        return false;
    }
    return true;
}

   /**
   * Checks if a text message is not empty.
   * @returns {boolean} True if there's any content in the message text.
   */
  textMessageNotEmpty() {
    return this.msgService.messageText.length > 0;
  }

   /**
   * Verifies if there is a file ready for upload.
   * @returns {boolean} True if there's a file selected for upload.
   */
  fileReadyForUpload() {
    return this.uploadService.upload_array.file_name.length > 0;
  }

  /**
  * Toggles the state of the new message component.
  */
  toggleOpenNewMsgComponent() {
    this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
  }

  /**
  * Prepares the message for sending. If there's an upload pending, it ensures the upload finishes first.
  */
  async messagePreperation() {
    await this.uploadService.checkForUpload();
    setTimeout(async () => {
      await this.msgService.newMessage();
      this.msgService.scrollToBottom('channel')
    }, 400);
    setTimeout(() => this.uploadService.emptyUploadArray(), 500);
  }

  /**
  * Adds a user's mention to the textarea at the current cursor position.
  * @param {number} i - The index of the user to be mentioned.
  */
  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.msgService.messageText = this.chatService.addUserToTextarea(i, this.msgService.messageText)
  }

  /**
  * Fetches all users for mentioning in the chat.
  */
  async getAllUsers() {
    this.chatService.at_users = await this.authService.getAllUsers();
  }

 /**
  * Opens a chat conversation. If it's different from the current chat, it loads the new chat's data.
  * @param {object} chat - The chat data to be opened.
  */
  async openChat(chat) {
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
    if (this.notSameChatID(chat)) {
      this.loadChatData(chat);
    }
  }


  /**
   * Loads the data related to a given chat.
   * @param {object} chat - The chat data to be loaded.
   */
  loadChatData(chat) {
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID = chat.chat_ID;
    this.msgService.emptyMessageText();
    try {
      this.chatService.currentChatData = chat;
      this.chatService.textAreaMessageTo();
      this.msgService.getMessages();
      this.chatService.thread_open = false;
    } catch (error) {
      console.error("Fehler bei öffnen des Chats: ", error);
    }
  }

  /**
   * Checks if the provided chat ID is different from the current chat ID.
   * @param {object} chat - The chat data to be compared.
   * @returns {boolean} True if the provided chat's ID is different from the current chat ID.
   */
  notSameChatID(chat) {
    return this.chatService.currentChatID !== chat.chat_ID;
  }

  /**
   * Handles the 'Enter' keypress event in the chat input.
   * Adds a newline to the message text if 'Shift + Enter' is pressed.
   * @param {KeyboardEvent} event - The triggered keyboard event.
   */
  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.key === 'Enter' && event.shiftKey) {
        this.msgService.messageText += ' ';
        this.msgService.messageText += '\n';
        this.msgService.messageText += ' ';
      }
    }
  }

  /**
   * Determines if no chat is currently selected.
   * @returns {boolean} True if no chat is selected.
   */
  noChatSelected() {
    return this.chatService.currentChatID === 'noChatSelected';
  }


  /**
   * Checks if the message text is empty.
   * @returns {boolean} True if the message text is not empty.
   */
  messageEmpty() {
    return this.msgService.messageText.length !== 0;
  }

  /**
   * Verifies if there isn't a file selected for upload.
   * @returns {boolean} True if no file is selected for upload.
   */
  noFileSelected() {
    return this.uploadService.upload_array.file_name.length !== 0;
  }
}