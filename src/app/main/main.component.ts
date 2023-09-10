import { Component } from '@angular/core';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  open_thread: boolean;
  sidebarVisible: boolean = true;
  timeoutSidebarHide: boolean = false;

  constructor(
    public chatService: ChatService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
    public messageService: MessagesService
  ) { }

  setVariable(value: boolean) {
    this.open_thread = value;
  }

  toggleSidebar() {
    if (this.sidebarVisible) {
      this.sidebarVisible = false;
      setTimeout(() => {
        this.timeoutSidebarHide = true;
      }, 300);
    } else {
      this.timeoutSidebarHide = false;
      setTimeout(() => {
        this.sidebarVisible = true;
      }, 10);
    }
  }
}
