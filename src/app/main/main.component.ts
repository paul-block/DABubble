import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { NewMsgService } from 'services/new-msg.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  open_thread: boolean

  constructor(public newMsgService: NewMsgService,  public fsDataThreadService: FirestoreThreadDataService) {
  }

  setVariable(value: boolean) {
    this.open_thread = value
  }
}
