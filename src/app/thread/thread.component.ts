import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';
import { DialogEditCommentComponent } from '../dialog-edit-comment/dialog-edit-comment.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from '../dialog-delete-comment/dialog-delete-comment.component';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiService } from '../../services/emoji.service';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {


  profileMenuRef: MatDialogRef<ProfileMenuComponent>;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;
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
  edit_comment_index: boolean;
  open_users: boolean;
  open_attachment_menu: boolean;
  uploadProgress: number = 0;
  





  constructor(
    public authenticationService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public emojiService: EmojiService,
    public dialog: MatDialog,
    private storage: AngularFireStorage
  ) { }

  @Output() threadClose = new EventEmitter<boolean>();
  selectedEmoji: string
  emojiPicker_open: boolean = false;



  async ngOnInit(): Promise<void> {
    document.body.addEventListener('click', this.bodyClicked);
    this.fsDataThreadService.getMessages()
  }


  closeThread(value: boolean) {
    this.threadClose.emit(value)
    this.fsDataThreadService.thread_open = false
  }


  openEmojiPicker(i: number) {
    this.picker_index = i
    this.emojiPicker_open = true
  }



  addEmojiInThread($event: any, i: number) {
    let array = this.fsDataThreadService.comments
    let user = this.authenticationService.userData.user_name
    this.emojiPicker_open = false
    this.fsDataThreadService.comments = this.emojiService.addEmoji($event, i, array, user)
    this.fsDataThreadService.updateData()
  }


  addOrRemoveEmojIinThread(i: number, j: number) {
    let array = this.fsDataThreadService.comments
    let user = this.authenticationService.userData.user_name
    this.hovered_emoji = false
    this.fsDataThreadService.comments = this.emojiService.addOrRemoveEmoji(i, j, array, user)
    this.fsDataThreadService.updateData()
  }


  bodyClicked = () => {
    if (this.emojiPicker_open == true) this.emojiPicker_open = false;
    if (this.edit_comment == true) this.edit_comment = false;
    if (this.open_users == true) this.open_users = false;
    if (this.open_attachment_menu == true) this.open_attachment_menu = false
  };


  stopPropagation(event: Event) {
    event.stopPropagation();
  };


  postComment() {
    if (this.comment_value.length > 0) {
      let time_stamp = new Date()
      let comment_data = {
        comment: this.comment_value,
        time: time_stamp,
        uid: this.authenticationService.getUid(),
        emoji_data: [],
        text_edited: false,
      }
      this.fsDataThreadService.saveThread(comment_data)
      this.comment_value = ''
      if (this.fsDataThreadService.comments?.length > 1) this.response = 'Antworten'
      if (this.fsDataThreadService.comments?.length < 2) this.response = 'Antwort'
    }
  }


  addEmojitoTextarea($event: any) {
    this.emojiPicker_open = false
    let unicodeCode: string = $event.emoji.unified
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.comment_value += emoji
  }


  checkIfEmojiExistinMessage($event: any) {
    if (this.channel_message.emoji_data.length == 0) return
    this.channel_message.emoji_data.forEach(element => {
      if (element.emoji == $event.emoji.colons) {
        element.count += 1
      }
    });
  }


  addEmojiToMessage($event: any) {
    this.emojiPicker_open = false
    this.emoji_exist = false
    this.checkIfEmojiExistinMessage($event)
    if (!this.emoji_exist) {
      let emoji_data = {
        emoji: $event.emoji.colons,
        count: 1,
        react_users: [this.authenticationService.userData.user_name]
      }
      this.channel_message.emoji_data.push(emoji_data)
    }
  }


  openEditCommentMenu(i: boolean) {
    this.edit_comment = true
    this.edit_comment_index = i
  }

  openEditComment(i: number) {
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogEditCommentComponent, {
      data: { comment: this.fsDataThreadService.comments[i].comment },
      panelClass: 'my-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.comments[i].comment = result;
        this.fsDataThreadService.comments[i].text_edited = true
        this.fsDataThreadService.updateData()
      }
    });
  }
  

  openDeleteComment(i: number) {
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      data: { comment: this.fsDataThreadService.comments[i].comment },
      panelClass: 'my-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.comments.splice(i, 1)
        this.fsDataThreadService.updateData()
      }
    });
  }



  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.comment_index = i
    this.emoji_index = j
  }


  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }


  openUsers() {
    this.open_users = true
  }


  addUserToTextarea(i: number) {
    this.comment_value += '@' + this.authenticationService.all_users[i].user_name
    this.messageTextarea.nativeElement.focus();
  }


  getImageUrl(uid: string): string {
    const user = this.authenticationService.all_users.find(element => element.uid === uid);
    return user.avatar
  }

  getUserName(uid: string) {
    const user = this.authenticationService.all_users.find(element => element.uid === uid);
    return user.user_name
  }

  getUserEmail(uid: string) {
    const user = this.authenticationService.all_users.find(element => element.uid === uid);
    return user.email
  }


  openProfile(uid: string) {
    if (this.getUserName(uid) == this.authenticationService.userData.user_name) this.openCurrentUserDetails()
    else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.panelClass = 'add-channel-dialog';
      dialogConfig.data = { user_name: this.getUserName(uid), user_email: this.getUserEmail(uid), user_id: uid};
      this.dialog.open(DialogProfileComponent, dialogConfig);
    }
  }



  openCurrentUserDetails() {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.position = {
        top: '80',
        right: '25'
      };
      dialogConfig.panelClass = 'custom-edit-channel-dialog';
      this.profileMenuRef = this.dialog.open(ProfileMenuComponent, dialogConfig);
      this.fsDataThreadService.detailsVisible = true
      this.profileMenuRef.afterClosed().subscribe(() => {
        this.fsDataThreadService.detailsVisible = false
      });
  }


  openAttachmentMenu() {
    this.open_attachment_menu = true
  }
}

