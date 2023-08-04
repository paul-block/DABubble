import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { emojis } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { AuthenticationService } from '../authentication.service';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {
  emoji_exist: boolean;


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


  openEmojiPicker() {
    this.emojiPicker_open = true
  }


  addEmoji($event: any) {
    this.emoji_exist = false
    this.emojiPicker_open = false
    this.checkIfEmojyExist($event.emoji.colons)
    if (!this.emoji_exist) {
      let emoji = {
        emoji: $event.emoji.colons,
        count: 1,
        uid: this.authenticationService.userData.user_name
      }
      this.emojis.push(emoji)
      console.log(this.emojis);
    }
  };


  checkIfEmojyExist(emoji: string) {
      this.emojis.forEach(element => {
      if (element.emoji == emoji) {
        element.count += 1
        this.emoji_exist = true
        console.log(this.emojis);
      }
    });
  }


  bodyClicked = () => {
     if (this.emojiPicker_open == true) this.emojiPicker_open = false;
  };

  stopPropagation(event: Event) {
       event.stopPropagation();
  };

}

