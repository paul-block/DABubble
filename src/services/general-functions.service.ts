import { Injectable } from '@angular/core';
import { FirestoreThreadDataService } from './firestore-thread-data.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralFunctionsService {
  showSidebarText: boolean = true;


  constructor( ) { }

  preventDefault(event: Event) {
    event.preventDefault();
  };

  stopPropagation(event: Event) {
    event.stopPropagation();
  };

  async generateCustomFirestoreID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }
    return id;
  }
}
