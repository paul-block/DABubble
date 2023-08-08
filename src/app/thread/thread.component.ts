import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { FirestoreThreadDataService } from 'src/services/firestore-thread-data.service';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {
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




  constructor(public authenticationService: AuthenticationService, public fsDataThreadService: FirestoreThreadDataService) { }

  @Output() threadClose = new EventEmitter<boolean>();
  selectedEmoji: string
  emojiPicker_open: boolean = false;



  ngOnInit(): void {
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


  addEmoji($event: any, i: number) {
    this.emoji_exist = false
    this.emojiPicker_open = false
    this.checkIfEmojiExist($event.emoji.colons, i)
    if (!this.emoji_exist) {
      let emoji_data = {
        emoji: $event.emoji.colons,
        count: 1,
        react_users: [this.authenticationService.userData.user_name]
      }
      this.fsDataThreadService.comments[i].emoji_data.push(emoji_data)
      this.fsDataThreadService.updateData()
    }
  }


  addOrRemoveEmoji(i: number, j: number) {
    let index = this.fsDataThreadService.comments[i].emoji_data[j].react_users.indexOf(this.authenticationService.userData.user_name)
    if (index == -1) {
      this.fsDataThreadService.comments[i].emoji_data[j].count += 1
      this.fsDataThreadService.comments[i].emoji_data[j].react_users.push(this.authenticationService.userData.user_name)
    }
    else {
      this.fsDataThreadService.comments[i].emoji_data[j].count -= 1
      this.fsDataThreadService.comments[i].emoji_data[j].react_users.splice(index, 1)
      if (this.fsDataThreadService.comments[i].emoji_data[j].count == 0) this.fsDataThreadService.comments[i].emoji_data.splice(j, 1)
      this.hovered_emoji = false
    }
    console.log(this.fsDataThreadService.comments[i]);
    
    this.fsDataThreadService.updateData()
  }




  checkIfEmojiExist(emoji: string, i: number) {
    this.fsDataThreadService.comments[i].emoji_data.forEach(element => {
      if (element.emoji == emoji) {
        this.emoji_exist = true
        if (element.react_users.includes(this.authenticationService.userData.user_name)) {
          let k = element.react_users.indexOf(this.authenticationService.userData.user_name)
          element.react_users.splice(k, 1)
          element.count -= 1
          if (element.count == 0) {
            let j = this.fsDataThreadService.comments[i].emoji_data.indexOf(element)
            this.fsDataThreadService.comments[i].emoji_data.splice(j, 1)
            this.fsDataThreadService.updateData()
          }
        }
        else
          element.react_users.push(this.authenticationService.userData.user_name)
        element.count += 1
      }
    });
    this.fsDataThreadService.updateData()
  }


  bodyClicked = () => {
    if (this.emojiPicker_open == true) this.emojiPicker_open = false;
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
        avatar: '',
        emoji_data: []
      }
      this.fsDataThreadService.saveThread(comment_data)
      this.comment_value = ''
      if (this.fsDataThreadService.comments.length > 1) this.response = 'Antworten'
      if (this.fsDataThreadService.comments.length < 2) this.response = 'Antwort'
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
        this.emoji_exist = true
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

  editComment(i: number, x: boolean) {
   
  }


  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.comment_index = i
    this.emoji_index = j
  }

  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }
}

