import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ReactionBubbleService {

  constructor(
    public authService: AuthenticationService,
  ) { }

/**
 * Replaces user names with 'Du' if they are the current user and sorts the names so that 'Du' comes first.
 * @param {string[]} react_userIDs - Array of user IDs who reacted.
 * @param {boolean} moreThen3Reactions - Flag to determine if there are more than 3 reactions.
 * @returns Array of sorted user names.
 */
  replaceNameWithDu(react_userIDs, moreThen3Reactions) {
    const names_react_user = this.switchIDsWithNames(react_userIDs);
    const sortedNames = this.sortNamesWithDuFirst(names_react_user);
    if (moreThen3Reactions) {
      return sortedNames.slice(0, 2);
    } else {
      return sortedNames;
    }
  }

/**
 * Converts an array of user IDs to their corresponding user names.
 * @param {string[]} react_userIDs - Array of user IDs.
 * @returns Array of user names.
 */
  switchIDsWithNames(react_userIDs) {
    const names_react_user = [];
    react_userIDs.forEach(react_userID => {
      if (react_userID === this.authService.userData.uid) {
        names_react_user.push('Du')
      } else {
        names_react_user.push(this.authService.getUserInfo(react_userID).user_name)
      }
    });
    return names_react_user;
  }

/**
 * Sorts an array of user names so that 'Du' comes first.
 * @param {string[]} names - Array of user names.
 * @returns Array of sorted user names.
 */
  sortNamesWithDuFirst(names: string[]): string[] {
    const sortedNames = names.slice();
    const duIndex = sortedNames.findIndex(name => name.includes('Du'));
    if (duIndex !== -1) {
      const duName = sortedNames.splice(duIndex, 1)[0];
      sortedNames.unshift(duName);
    }
    return sortedNames;
  }

}
