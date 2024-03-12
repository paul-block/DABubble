import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnInit {
  inActivitySubject = new BehaviorSubject<boolean>(false);
  inactivityTimer: number = 0;


  ngOnInit() {
    this.startMonitoring();
  }

  /**
   * Resets the inactivity timer. If there's no activity (e.g., mousemove or keydown) detected
   * within the specified inactivity duration, it emits a value to inform subscribers about the inactivity.
   */
  resetTimer() {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = window.setTimeout(() => {
      this.inActivitySubject.next(true);
    }, this.getInactivityDuration());
  }

  /**
   * Gets the inactivity duration.
   * @returns {number} The inactivity duration in milliseconds.
   */
  private getInactivityDuration(): number {
    return 10 * 60 * 1000;
  }

  /**
   * Initiates the monitoring of user activities. 
   * It sets up event listeners for mouse movements and key presses to reset the inactivity timer.
   */
  startMonitoring(): void {
    this.resetTimer();
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keydown', () => this.resetTimer());
  }
}
