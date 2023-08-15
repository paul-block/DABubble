import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  emoji_exist: boolean = false
  textMessage: string = '';
  emojiPicker_open: boolean = false;
  picker_index: number;
  picker_reaction_bar: boolean = false;
  constructor() { }


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


  checkIfEmojiExist(emoji: string, i: number, array, user: string) {
    array[i].emoji_data.forEach(element => {
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


  addEmojitoTextarea($event: any) {
    this.emojiPicker_open = false;
    let unicodeCode: string = $event.emoji.unified;
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.textMessage += emoji;
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  };

  openEmojiPicker(i: number) {
    this.picker_index = i;
  }
}




