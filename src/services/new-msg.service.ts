import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewMsgService {
  private _openNewMsg = new BehaviorSubject<boolean>(false);
  public readonly openNewMsg$ = this._openNewMsg.asObservable();

  user_name: string;
  directedFromProfileButton:boolean = false;


  constructor() { }

  toggleNewMsg() {
    this._openNewMsg.next(!this._openNewMsg.getValue());
  }

  openNewMsgComponent() {
   // funktion die immer öffnet, nicht toggled 
  }
}
