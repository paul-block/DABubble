import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent {

  @Output() threadClose = new EventEmitter<boolean>();

  closeThread(value: boolean) {
    this.threadClose.emit(value)
  }
}
