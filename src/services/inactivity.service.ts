import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private activitySubject = new Subject<void>();
  private inactivityTimer: number;

/**
 * Resets the inactivity timer. If there's no activity (e.g., mousemove or keydown) detected
 * within the specified inactivity duration, it emits a value to inform subscribers about the inactivity.
 */
  private resetTimer(): void {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = window.setTimeout(() => {
      this.activitySubject.next();
    }, this.getInactivityDuration());
  }

/**
 * Gets the inactivity duration.
 *
 * @returns {number} The inactivity duration in milliseconds.
 */
  private getInactivityDuration(): number {
    return 15 * 60 * 1000;
  }

/**
 * Initiates the monitoring of user activities. 
 * It sets up event listeners for mouse movements and key presses to reset the inactivity timer.
 */
  startMonitoring(): void {
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keydown', () => this.resetTimer());
    this.resetTimer();
  }

/**
 * Provides an observable that emits a value when user inactivity is detected.
 *
 * @returns {Observable<void>} An observable that informs about the user's inactivity.
 */
  get inactivityObservable(): Observable<void> {
    return this.activitySubject.asObservable();
  }
}
