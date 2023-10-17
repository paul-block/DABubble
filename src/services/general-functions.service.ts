import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralFunctionsService {
  showSidebarText: boolean = true;
  changeMobileLogo: boolean = false;
  isMobileScreen: boolean = false;
  public highlightInput: Subject<boolean> = new Subject<boolean>();

  constructor() {}

/**
 * Prevents the default behavior of an event.
 *
 * @param {Event} event - The event to prevent the default action for.
 */
  preventDefault(event: Event) {
    event.preventDefault();
  };

/**
 * Stops the propagation of an event to parent elements.
 *
 * @param {Event} event - The event to stop propagation for.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  };

/**
 * Generates a custom Firestore document ID.
 * The ID is composed of 20 characters containing both uppercase, lowercase alphabets, and numbers.
 *
 * @returns {Promise<string>} A promise that resolves with the generated ID.
 */
  async generateCustomFirestoreID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }
    return id;
  }

/**
 * Checks if the current window width corresponds to mobile dimensions.
 *
 * @returns {boolean} True if window width is less than or equal to 1000, otherwise false.
 */
  isMobileWidth() {
    return window.innerWidth <= 1000;
  }

/**
 * Checks if the current window width corresponds to desktop dimensions.
 *
 * @returns {boolean} True if window width is greater than 1000, otherwise false.
 */
  isDesktopWidth() {
    return window.innerWidth > 1000;
  }
}
