import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { DialogEditCommentComponent } from '../dialog-edit-comment/dialog-edit-comment.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from '../dialog-delete-comment/dialog-delete-comment.component';
import { EmojiService } from '../../services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { ChatService } from 'services/chat.service';
import { UploadService } from 'services/upload.service';
import { ReactionBubbleService } from 'services/reaction-bubble.service';
import { ProfileService } from 'services/profile.service';
import { ChannelService } from 'services/channel.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit {
  @ViewChild('ChatContainerREF') public scrollContainer: ElementRef;
  @ViewChildren('comment') comments: QueryList<ElementRef>;
  @ViewChild('type_message') textarea!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;
  private scrollSubscription: Subscription;
  emoji_exist: boolean;
  react_user: string = 'test'
  comment_value: string = ''
  picker_index: number
  response: string = 'Antwort'
  channel_message = {
    emoji_data: []
  }
  emoji_data = []
  comment_index: number;
  emoji_index: number;
  hovered_emoji: boolean = false
  edit_comment: boolean = false;
  edit_comment_index: number;
  open_attachment_menu: boolean;
  uploadProgress: number = 0;
  selectedEmoji: string
  emojiPicker_open: boolean = false;
  show_picker_above: boolean
  regex = /[^\n]/;


  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public emojiService: EmojiService,
    public dialog: MatDialog,
    public msgService: MessagesService,
    public chatService: ChatService,
    public uploadService: UploadService,
    public reactionBubbleService: ReactionBubbleService,
    public profileService: ProfileService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService,
  ) { }


/**
  * Initializes the component.
  * Attaches a click listener to the body element and retrieves thread messages.
  * Subscribes to the scroll observable to automatically scroll the div to the bottom when needed.
  */
  async ngOnInit(): Promise<void> {
    document.body.addEventListener('click', this.bodyClicked);
    this.fsDataThreadService.getMessages()
    await this.getAllUsers()
    this.scrollSubscription = this.msgService.scrollObservableThread.subscribe(() => {
      this.scrollDivToBottom();
    });
  }

/**
 * Cleanup resources when the component is destroyed.
 * Unsubscribes from the scroll observable to prevent memory leaks.
 */
  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

/**
 * Scrolls the chat content to the top smoothly.
 */
  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

/**
 * Scrolls the chat content to the bottom.
 */
  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTop = scrollContainerElement.scrollHeight;
  }

/**
 * Closes the thread section in the chat.
 * @param {boolean} value - not used in the current method, but might be necessary for future extensions or event binding.
 */
  closeThread(value: boolean) {
    this.chatService.thread_open = false
  }

/**
 * Opens the emoji picker near the specified chat message or comment.
 * Checks the position of the target to decide where the emoji picker should be opened (above or below).
 * @param {number} i - The index of the message or comment.
 * @param {string} section - Indicates the target section ('textarea' or 'comment').
 */
  openEmojiPicker(i: number, section: string) {
    this.show_picker_above = false
    const textAreaRect = this.textarea.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (textAreaRect.bottom > viewportHeight - 427 && section == 'textarea') this.show_picker_above = true
    if (this.comments && section === 'comment') {
      let ArrayEmojiMessagePopupsRef = [];
      this.comments.forEach((popupRef) => {
        ArrayEmojiMessagePopupsRef.push(popupRef);
      });
      let commentRect = ArrayEmojiMessagePopupsRef[i].nativeElement.getBoundingClientRect();
      if (commentRect.top > viewportHeight - 427) this.show_picker_above = true;
    }
    this.picker_index = i
    this.emojiPicker_open = true
  }

/**
 * Adds the selected emoji to the chat message or comment in the thread.
 * Updates the thread data after adding the emoji.
 * @param {any} $event - The event object containing the selected emoji.
 * @param {number} i - The index of the message or comment.
 */
  addEmojiInThread($event: any, i: number) {
    let array = this.fsDataThreadService.comments
    let user = this.authService.userData.uid
    this.emojiPicker_open = false
    this.fsDataThreadService.comments = this.emojiService.addEmoji($event, i, array, user)
    this.fsDataThreadService.updateData()
  }

/**
 * Adds or removes an emoji in the thread based on user's action.
 * It updates the thread's data after the emoji is added or removed.
 * 
 * @param {number} i - The index of the comment in the thread where the emoji is being added or removed.
 * @param {number} j - The index of the emoji that is being added or removed from the comment.
 */
  addOrRemoveEmojIinThread(i: number, j: number) {
    this.fsDataThreadService.current_changed_index = i
    let array = this.fsDataThreadService.comments
    let user = this.authService.userData.uid
    this.hovered_emoji = false
    this.fsDataThreadService.comments = this.emojiService.addOrRemoveEmoji(i, j, array, user)
    this.fsDataThreadService.updateData()
  }

/**
 * Listens for a click event on the body element and triggers respective behaviors.
 * Used to close open components like emoji picker and comment editor.
 */
  bodyClicked = () => {
    if (this.emojiPicker_open == true) this.emojiPicker_open = false;
    if (this.edit_comment == true) this.edit_comment = false;
    if (this.chatService.open_users == true) {
      this.chatService.open_users = false;
      this.getAllUsers()
    }
    if (this.open_attachment_menu == true) this.open_attachment_menu = false
  };

/**
 * Posts a new comment to the thread.
 * Checks for attached uploads and includes them with the comment.
 * If the comment is valid and not just whitespace, it's saved to the thread.
 */
  async postComment() {
    if (this.uploadService.upload_array.file_name.length > 0) await this.uploadService.prepareUploadfiles()
    if (this.comment_value.length > 0 && !this.checkComment(this.comment_value) || this.uploadService.upload_array.file_name.length > 0) {

      this.fsDataThreadService.saveThread(this.commentData()),
        this.msgService.scrollToBottom('thread')

      if (this.fsDataThreadService.comments?.length > 1) this.response = 'Antworten'
      if (this.fsDataThreadService.comments?.length < 2) this.response = 'Antwort'
      setTimeout(() => this.uploadService.emptyUploadArray(), 500);
    }
  }

/**
 * Gathers the data necessary for posting a new comment.
 * Returns the constructed comment data.
 * @returns {Object} The comment data ready to be posted.
 */
  commentData() {
    let time_stamp = new Date()
    let comment_data = {
      comment: this.comment_value,
      modified_comment: this.chatService.modifyMessageValue(this.comment_value),
      time: time_stamp,
      uid: this.authService.getUid(),
      emoji_data: [],
      text_edited: false,
      uploaded_files: this.uploadService.upload_array
    };
    this.comment_value = ''
    return comment_data;
  }

/**
 * Checks whether the provided text string is empty or just whitespace.
 * @param {string} text - The text to check.
 * @returns {boolean} Returns true if the text is empty or just whitespace.
 */
  checkComment(text: string) {
    const cleanedStr = text.replace(/\s/g, '');
    return cleanedStr === '';
  }

/**
 * Adds the selected emoji to the text area input for a comment.
 * @param {any} $event - The event object containing the selected emoji.
 */
  addEmojitoTextarea($event: any) {
    let unicodeCode: string = $event.emoji.unified
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.comment_value += emoji
  }

/**
 * Checks if the selected emoji already exists in the message.
 * Updates the emoji count if the emoji is already present.
 * @param {any} $event - The event object containing the selected emoji.
 */
  checkIfEmojiExistinMessage($event: any) {
    if (this.channel_message.emoji_data.length == 0) return
    this.channel_message.emoji_data.forEach(element => {
      if (element.emoji == $event.emoji.colons) {
        element.count += 1
      }
    });
  }

/**
 * Adds the selected emoji to a chat message.
 * If the emoji doesn't exist in the message, a new entry is added.
 * @param {any} $event - The event object containing the selected emoji.
 */
  addEmojiToMessage($event: any) {
    this.emojiPicker_open = false
    this.emoji_exist = false
    this.checkIfEmojiExistinMessage($event)
    if (!this.emoji_exist) {
      let emoji_data = {
        emoji: $event.emoji.colons,
        count: 1,
        react_users: [this.authService.userData.uid]
      }
      this.channel_message.emoji_data.push(emoji_data)
    }
  }

/**
 * Opens the menu for editing comments.
 * @param {number} i - The index of the comment to be edited.
 */
  openEditCommentMenu(i: number) {
    this.edit_comment = true
    this.edit_comment_index = i
  }

/**
 * Opens a dialog for editing the content of a comment.
 * @param {number} i - The index of the comment to be edited.
 */
  openEditComment(i: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'edit_comment';
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogEditCommentComponent, {
      ...dialogConfig,
      data: { comment: this.fsDataThreadService.comments[i].comment }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.comments[i].comment = result;
        this.fsDataThreadService.comments[i].modified_comment = this.chatService.modifyMessageValue(result)
        this.fsDataThreadService.comments[i].text_edited = true
        this.fsDataThreadService.updateData()
      }
    });
  }

/**
 * Opens a dialog to confirm the deletion of a comment.
 * @param {number} i - The index of the comment to be deleted.
 */
  openEditMessage() {
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogEditCommentComponent, {
      data: { comment: this.fsDataThreadService.current_chat_data.chat_message }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.current_chat_data.chat_message = result;
        this.fsDataThreadService.current_chat_data.modified_message = this.chatService.modifyMessageValue(result)
        this.fsDataThreadService.current_chat_data.chat_message_edited = true
        this.msgService.saveEditedMessageFromThread(this.fsDataThreadService.current_chat_data)
      }
    });
  }

/**
 * Opens the delete comment dialog for the specified comment. After closing the dialog, 
 * it checks if the current comment is the last one, and if so, deletes the entire thread.
 * Otherwise, just updates the thread by removing the comment.
 *
 * @param {number} i - The index of the comment to be deleted.
 */
  openDeleteComment(i: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'delete_comment';
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      ...dialogConfig,
      data: { comment: this.fsDataThreadService.comments[i].comment },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result || result == '') {
        if (this.checkIfLastAnswer()) this.deleteThread()
        else this.updateThread(i)
      }
    });
  }

/**
 * Deletes the entire thread from the chat service and data service.
 */
  deleteThread() {
    this.msgService.deleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
    this.fsDataThreadService.deletThread()
    this.chatService.thread_open = false
  }

/**
 * Updates the thread by removing a comment at the given index.
 * @param {number} i - The index of the comment to be removed.
 */
  updateThread(i: number) {
    this.fsDataThreadService.comments.splice(i, 1)
    this.fsDataThreadService.fake_array.length = this.fsDataThreadService.comments.length
    this.fsDataThreadService.updateData()
  }

/**
 * Checks if the last message is being answered.
 * @returns {boolean} - Returns true if the current chat data is the last answer, otherwise returns false.
 */
  checkIfLastAnswer() {
    if (this.fsDataThreadService.current_chat_data.answers == 1 && this.fsDataThreadService.current_chat_data.message_deleted) return true
    else return false
  }

/**
 * Opens the delete message option for the current chat data.
 */
  openDeleteMessage() {
    this.edit_comment = false;
    this.msgService.openDeleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
  }

/**
 * Displays the users who reacted to a message or comment using emojis.
 *
 * @param {number} i - The index of the message or comment.
 * @param {number} j - The index of the emoji.
 */
  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.comment_index = i
    this.emoji_index = j
  }

/**
 * Closes the display of users who reacted to a message or comment.
 */
  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }

/**
 * Opens the list of users available for chat.
 */
  openUsers() {
    this.getAllUsers()
    this.chatService.open_users = true
  }

/**
 * Retrieves the image URL (avatar) for a given user ID.
 * @param {string} uid - The unique ID of the user.
 * @returns {string} - The URL of the user's avatar.
 */
  getImageUrl(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.avatar
  }

/**
 * Retrieves the username for a given user ID.
 * @param {string} uid - The unique ID of the user.
 * @returns {string} - The username of the user.
 */
  getUserName(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.user_name
  }

/**
 * Retrieves the email address for a given user ID.
 * @param {string} uid - The unique ID of the user.
 * @returns {string} - The email address of the user.
 */
  getUserEmail(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.email
  }

/**
 * Opens the attachment menu for uploading files to the thread.
 */
  openAttachmentMenu() {
    this.open_attachment_menu = true
    this.uploadService.chat_section = 'thread'
  }

/**
 * Adds or removes an emoji reaction on a direct chat message.
 * @param {number} i - The index of the message.
 * @param {number} j - The index of the emoji.
 */
  addOrRemoveEmojisOnDirectChatMessage(i: number, j: number) {
    this.hovered_emoji = false
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }

/**
 * Adds the selected emoji to the direct chat message.
 * @param {any} $event - The event object containing the selected emoji.
 * @param {number} i - The index of the message.
 */
  addEmojiInDirectMessage($event: any, i: number) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiPicker_open = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }


/**
 * Updates the textarea's value based on the given text input.
 * @param {string} text - The text input from the user.
 */
  textChanged(text: string) {
    this.comment_value = this.chatService.textChanged(text)
  }

/**
 * Adds the selected user's name to the textarea.
 * @param {number} i - The index of the selected user.
 */
  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.comment_value = this.chatService.addUserToTextarea(i, this.comment_value)
  }

/**
 * Retrieves all the users available for chat.
 */
  async getAllUsers() {
    this.chatService.at_users = await this.authService.getAllUsers();
  }

/**
 * Handles the enter key press event for the textarea.
 * @param {KeyboardEvent} event - The key press event.
 */
  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.key === 'Enter' && event.shiftKey) {
        this.comment_value += ' '
        this.comment_value += '\n';
        this.comment_value += ' '
      }
    }
  }

/**
 * Deletes a specific uploaded file from the chat and checks if the message is the last one in the thread.
 * @param {string} filename - The name of the file to be deleted.
 * @param {number} k - The index of the file.
 */
  deleteUploadFile(filename: string, k: number) {
    this.uploadService.deleteSelectedFile(filename, this.fsDataThreadService.direct_chat_index, k, 'mainChat')
    if (this.fsDataThreadService.current_chat_data.answers == 0 && this.fsDataThreadService.current_chat_data.chat_message == '') this.deleteThread()
  }
}
