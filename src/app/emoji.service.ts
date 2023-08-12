import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {
  emoji_exist: boolean = false

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


  checkIfEmojiExist(emoji: string, i: number, array, user:string) {
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
        }
        else
          element.react_users.push(user)
        element.count += 1
      }
    });
  }
}




