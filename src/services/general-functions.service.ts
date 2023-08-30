import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralFunctionsService {

  constructor() { }

  preventDefault(event: Event) {
    event.preventDefault();
  };
}
