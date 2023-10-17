import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  emoji_exist: boolean = false
  textMessage: string = '';
  emojiPicker_open: boolean = false;
  picker_index: number;
  picker_reaction_bar: boolean = false;
  openPickerBelow: boolean = false;
  checkMarkManualEvent: any =
    {
      "emoji": {
        "name": "White Heavy Check Mark",
        "unified": "2705",
        "keywords": [
          "check_mark_button",
          "green-square",
          "ok",
          "agree",
          "vote",
          "election",
          "answer",
          "tick"
        ],
        "sheet": [
          58,
          24
        ],
        "shortName": "white_check_mark",
        "shortNames": [
          "white_check_mark"
        ],
        "id": "white_check_mark",
        "native": "✅",
        "skinVariations": [],
        "emoticons": [],
        "hidden": [],
        "text": "",
        "set": "apple",
        "colons": ":white_check_mark:"
      },
      "$event": {
        "isTrusted": true
      }
    };

  raisedHandsManualEvent: any =
    {
      "emoji": {
        "name": "Person Raising Both Hands in Celebration",
        "unified": "1F64C",
        "keywords": [
          "raising_hands",
          "gesture",
          "hooray",
          "yea",
          "celebration",
          "hands"
        ],
        "sheet": [
          34,
          45
        ],
        "skinVariations": [
          {
            "unified": "1F64C-1F3FB",
            "sheet": [
              34,
              46
            ]
          },
          {
            "unified": "1F64C-1F3FC",
            "sheet": [
              34,
              47
            ]
          },
          {
            "unified": "1F64C-1F3FD",
            "sheet": [
              34,
              48
            ]
          },
          {
            "unified": "1F64C-1F3FE",
            "sheet": [
              34,
              49
            ]
          },
          {
            "unified": "1F64C-1F3FF",
            "sheet": [
              34,
              50
            ]
          }
        ],
        "shortName": "raised_hands",
        "shortNames": [
          "raised_hands"
        ],
        "id": "raised_hands",
        "native": "🙌",
        "emoticons": [],
        "hidden": [],
        "text": "",
        "set": "apple",
        "colons": ":raised_hands:"
      },
      "$event": {
        "isTrusted": true
      }
    }

  initializedEmojiMessageRef = false;
  initializedEmojiReactionBarRef = false;
  ArrayEmojiMessagePopupsRef = [];
  ArrayEmojiPopupReactionBarRef = [];

  constructor() { }

/**
 * Adds or removes an emoji reaction to a message or comment.
 * 
 * @param {number} i - The index of the message or comment.
 * @param {number} j - The index of the emoji in the message or comment's emoji_data array.
 * @param {any} array - The list of messages or comments.
 * @param {string} user - The ID of the user reacting.
 * @returns {any} The updated list of messages or comments.
 */
  addOrRemoveEmoji(i: number, j: number, array, user: string) {
    let index = array[i].emoji_data[j].react_users.indexOf(user)
    if (index == -1) {
      array[i].emoji_data[j].count += 1
      array[i].emoji_data[j].react_users.push(user)
    }
    else {
      array[i].emoji_data[j].count -= 1
      array[i].emoji_data[j].react_users.splice(index, 1)
      if (array[i].emoji_data[j].count == 0) {
        array[i].emoji_data.splice(j, 1)
      }
    }
    return array
  }

/**
 * Adds an emoji reaction to a message or comment.
 * 
 * @param {any} $event - The event object containing the selected emoji.
 * @param {number} i - The index of the message or comment.
 * @param {any} array - The list of messages or comments.
 * @param {string} user - The ID of the user reacting.
 * @returns {any} The updated list of messages or comments.
 */
  addEmoji($event: any, i: number, array, user: string) {
    this.emoji_exist = false
    this.checkIfEmojiExist($event.emoji.colons, i, array, user)
    if (this.emoji_exist) return array
    if (!this.emoji_exist) {
      let emoji_data = {
        emoji: $event.emoji.colons,
        count: 1,
        react_users: [user]
      }
      array[i].emoji_data.push(emoji_data)
      return array
    }
  }

/**
 * Checks if an emoji already exists in the emoji_data of a given message or comment.
 * 
 * @param {string} emoji - The emoji string to check for.
 * @param {number} i - The index of the message or comment.
 * @param {any[]} array - The list of messages or comments.
 * @param {string} user - The ID of the user reacting.
 */
  checkIfEmojiExist(emoji: string, i: number, array: { emoji_data: any[]; }[], user: string) {
    array[i].emoji_data.forEach((element: { emoji: string; react_users: string[]; count: number; }) => {
      if (element.emoji == emoji) {
        this.emoji_exist = true
        if (element.react_users.includes(user)) {
          let index = element.react_users.indexOf(user)
          element.react_users.splice(index, 1)
          element.count -= 1
          if (element.count == 0) {
            let index = array[i].emoji_data.indexOf(element)
            array[i].emoji_data.splice(index, 1)
          }
        } else
          element.react_users.push(user);
        element.count += 1;
      }
    });
  }

/**
 * Adds an emoji character to the message text area.
 * 
 * @param {any} $event - The event object containing the selected emoji.
 */
  addEmojitoTextarea($event: any) {
    this.emojiPicker_open = false;
    let unicodeCode: string = $event.emoji.unified;
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.textMessage += emoji;
  }

/**
 * Prevents an event from propagating further.
 * 
 * @param {Event} event - The event to be stopped.
 */
  stopPropagation(event: Event) {
    event.stopPropagation();
  };

/**
 * Opens the emoji picker at a specified index.
 * 
 * @param {number} i - The index at which the emoji picker should be opened.
 */
  openEmojiPicker(i: number) {
    this.picker_index = i;
  }

/**
 * Initializes an array of references to message emoji popups.
 * 
 * @param {QueryList<ElementRef>} ElementEmojiMessagePopupsRef - The list of ElementRef for message emoji popups.
 */
  async initEmojiMessageElements(ElementEmojiMessagePopupsRef: QueryList<ElementRef>) {
    this.ArrayEmojiMessagePopupsRef = [];
    ElementEmojiMessagePopupsRef.forEach((popupRef) => {
      this.ArrayEmojiMessagePopupsRef.push(popupRef);
    });
  }

/**
 * Initializes an array of references to the emoji reaction bar popups.
 * 
 * @param {QueryList<ElementRef>} ElementEmojiPopupReactionBarRef - The list of ElementRef for the emoji reaction bar popups.
 */
  async initEmojiReactionBarElements(ElementEmojiPopupReactionBarRef: QueryList<ElementRef>) {
    this.ArrayEmojiPopupReactionBarRef = [];
    ElementEmojiPopupReactionBarRef.forEach((popupRef) => {
      this.ArrayEmojiPopupReactionBarRef.push(popupRef);
    });
  }

/**
 * Determines whether an emoji popup should open above or below a specific position.
 * 
 * @param {number} i - The index of the message or comment.
 * @param {string} section - Indicates whether the emoji popup is for a "Message" or "ReactionBar".
 * @param {ElementRef} chatContainer - The ElementRef of the chat container.
 * @param {QueryList<ElementRef>} ElementEmojiMessagePopupsRef - The list of ElementRef for message emoji popups.
 * @param {QueryList<ElementRef>} ElementEmojiPopupReactionBarRef - The list of ElementRef for the emoji reaction bar popups.
 */
  async checkOpenEmojiPopupAboveOrBelow(i: number, section: string, chatContainer: ElementRef, ElementEmojiMessagePopupsRef: QueryList<ElementRef>, ElementEmojiPopupReactionBarRef: QueryList<ElementRef>) {
    const container = chatContainer.nativeElement.getBoundingClientRect();
    let emojiPopup: ElementRef;
    if (section === 'Message') {
      if (!this.initializedEmojiMessageRef) await this.initEmojiMessageElements(ElementEmojiMessagePopupsRef);
      emojiPopup = this.ArrayEmojiMessagePopupsRef[i];
      this.initializedEmojiMessageRef = true;
    } else if (section === 'ReactionBar') {
      if (!this.initializedEmojiReactionBarRef) await this.initEmojiReactionBarElements(ElementEmojiPopupReactionBarRef);
      emojiPopup = this.ArrayEmojiPopupReactionBarRef[i];
      this.initializedEmojiReactionBarRef = true;
    }
    this.decidePopupOpenAboveOrBelow(emojiPopup, container);
  }

/**
 * Decides whether the emoji popup should open above or below based on the available space.
 * 
 * @param {ElementRef<any>} emojiPopup - The ElementRef of the emoji popup.
 * @param {{ top: number; }} container - The bounding client rect of the chat container.
 */
  decidePopupOpenAboveOrBelow(emojiPopup: ElementRef<any>, container: { top: number; }) {
    const viewportHeight = window.innerHeight;
    const emojiPopupRect = emojiPopup.nativeElement.getBoundingClientRect();
    const emojiPickerHeight = 427;
    if (emojiPopupRect.top - emojiPickerHeight < container.top || emojiPopupRect.top - emojiPickerHeight > viewportHeight) this.openPickerBelow = true;
    else this.openPickerBelow = false;
  }

/**
 * Resets the initialization flags for the emoji references.
 */
  resetInitializedEmojiRef() {
    this.initializedEmojiMessageRef = false;
    this.initializedEmojiReactionBarRef = false;
  }
}




