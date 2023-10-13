import { Component, HostListener } from '@angular/core';
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
  windowWidth: number;

  constructor(
    public chatService: ChatService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
    public messageService: MessagesService
  ) { }

/**
  * Initializes the `windowWidth` property with the current width of the window.
  */
  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
  }

/**
  * Listener for window resizing. Updates the `windowWidth` property with the current width of the window.
  * Hides the sidebar if the window width drops below 1500px and a thread is open.
  * @param {Event} event - Event object containing information about the resizing.
  */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth < 1500 && this.chatService.thread_open == true) this.chatService.sidebarVisible = false;
  }

/**
   * Sets the `open_thread` property based on the provided value.
   * @param {boolean} value - The value to set for the `open_thread` property.
   */
  setVariable(value: boolean) {
    this.open_thread = value;
  }
}
