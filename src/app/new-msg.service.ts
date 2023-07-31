import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewMsgService {
  private _openNewMsg = new BehaviorSubject<boolean>(false);
  public readonly openNewMsg$ = this._openNewMsg.asObservable();


  constructor() { }

  toggleNewMsg() {
    this._openNewMsg.next(!this._openNewMsg.getValue());
  }
}
