import { Component } from '@angular/core';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChatService } from 'services/chat.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  open_thread: boolean

  constructor(public chatService: ChatService,  public fsDataThreadService: FirestoreThreadDataService) {
  }

  setVariable(value: boolean) {
    this.open_thread = value
  }
}
