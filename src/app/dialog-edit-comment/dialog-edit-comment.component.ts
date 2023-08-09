import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-comment',
  templateUrl: './dialog-edit-comment.component.html',
  styleUrls: ['./dialog-edit-comment.component.scss']
  
})
export class DialogEditCommentComponent {

  constructor(public dialogRef: MatDialogRef<DialogEditCommentComponent>,  @Inject(MAT_DIALOG_DATA) public data: {comment: string}) {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
