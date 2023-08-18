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
  openNewMsg: boolean;
  private _subscription: Subscription;


  constructor(private NewMsgService: NewMsgService,  public fsDataThreadService: FirestoreThreadDataService) {
    this._subscription = this.NewMsgService.openNewMsg$.subscribe(open => this.openNewMsg = open);
  }

  setVariable(value: boolean) {
    this.open_thread = value
  }
}
