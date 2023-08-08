import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-comment',
  templateUrl: './dialog-edit-comment.component.html',
  styleUrls: ['./dialog-edit-comment.component.scss']
})
export class DialogEditCommentComponent {

  constructor(public dialogRef: MatDialogRef<DialogEditCommentComponent>) {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
