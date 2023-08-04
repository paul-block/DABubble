import { Component, EventEmitter, Output } from '@angular/core';
import { emojis } from '@ctrl/ngx-emoji-mart/ngx-emoji';


@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent {

  
  @Output() threadClose = new EventEmitter<boolean>();
  emoji: any;


  closeThread(value: boolean) {
    this.threadClose.emit(value)
  }


  addEmoji($event) {
    console.log($event.emoji);
    
    this.emoji = $event.emoji.native
 
    
   

  }
}
