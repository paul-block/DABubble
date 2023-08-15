import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';
import { DialogEditCommentComponent } from '../dialog-edit-comment/dialog-edit-comment.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from '../dialog-delete-comment/dialog-delete-comment.component';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiService } from '../../services/emoji.service';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {

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
  all_users: any
  open_users: boolean;





  constructor(
    public authenticationService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public emojiService: EmojiService,
    public dialog: MatDialog
  ) { }

  @Output() threadClose = new EventEmitter<boolean>();
  selectedEmoji: string
  emojiPicker_open: boolean = false;



  async ngOnInit(): Promise<void> {
    document.body.addEventListener('click', this.bodyClicked);
    this.fsDataThreadService.getMessages()
     this.all_users = await this.authenticationService.getAllUsers()
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
  };


  stopPropagation(event: Event) {
    event.stopPropagation();
  };


  postComment() {
    if (this.comment_value.length > 0) {
      let time_stamp = new Date()
      let comment_data = {
        comment: this.comment_value,
        user: this.authenticationService.userData.user_name,
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
    this.comment_value += '@' + this.all_users.__zone_symbol__value[i].user_name
    this.messageTextarea.nativeElement.focus();
  }


  getImageUrl(uid:string):string {
    const user = this.all_users.find(element => element.uid === uid);
    console.log(this.all_users);
    
    return user.avatar
  }
}

