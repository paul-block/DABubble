import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { NewMsgService } from '../new-msg.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  openNewMsg:boolean;
  private _subscription: Subscription;

  
  constructor(private NewMsgService: NewMsgService) {
    this._subscription = this.NewMsgService.openNewMsg$.subscribe(open => this.openNewMsg = open);
  }
}
