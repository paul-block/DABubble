import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-comment',
  templateUrl: './dialog-edit-comment.component.html',
  styleUrls: ['./dialog-edit-comment.component.scss']

})
export class DialogEditCommentComponent {

  emojiPicker_open: boolean = false

  constructor(
    public dialogRef: MatDialogRef<DialogEditCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { comment: string }
  ) { }

/**
 * Closes the currently opened dialog without performing any action.
 */
  onNoClick(): void {
    this.dialogRef.close();
  }

/**
 * Opens the emoji picker interface for user input.
 */
  openEmojiPicker() {
    this.emojiPicker_open = true;
  }

/**
  * add the selected emoji to the textarea
  * 
  * @param $event emoji is selected
  */
  addEmoji($event: any) {
    this.emojiPicker_open = false;
    let unicodeCode: string = $event.emoji.unified;
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.data.comment += emoji;
  }
}
