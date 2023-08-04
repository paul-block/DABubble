import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { AuthenticationService } from '../authentication.service';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {
  emoji_exist: boolean;
  who_react: string = 'test'
  comment_value: string = ''
  comments = []
  picker_index: number
  response:string = 'Antwort'


  constructor(public authenticationService: AuthenticationService) { }

  @Output() threadClose = new EventEmitter<boolean>();
  selectedEmoji: string
  emojiPicker_open: boolean = false;
  emojis = []

  ngOnInit(): void {
    document.body.addEventListener('click', this.bodyClicked);
  }

  closeThread(value: boolean) {
    this.threadClose.emit(value)
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
        react_users: this.authenticationService.userData.user_name
      }
      this.comments[i].emoji_data.push(emoji_data)
    }
    console.log(this.comments);

  }



  checkIfEmojiExist(emoji: string, i: number) {
    this.comments[i].emoji_data.forEach(element => {
      if (element.emoji == emoji) {
        element.count += 1
        this.emoji_exist = true
      }
    });
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
        emoji_data: [],
      }
      this.comments.push(comment_data)
      this.comment_value = ''
      if(this.comments.length > 1) this.response = 'Antworten'
      if(this.comments.length < 2) this.response = 'Antwort'
      console.log(this.comments);
    }
  }


  addEmojitoTextarea($event) {
    console.log($event.emoji);
    let unicodeCode: string = $event.emoji.unified
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.comment_value += emoji
  }

}

