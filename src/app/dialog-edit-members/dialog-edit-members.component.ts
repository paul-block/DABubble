import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-members',
  templateUrl: './dialog-edit-members.component.html',
  styleUrls: ['./dialog-edit-members.component.scss']
})
export class DialogEditMembersComponent {
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;
  constructor(private dialogRef: MatDialogRef<DialogEditMembersComponent>) {
  }

  closeRedirectAddMember() {
    this.dialogRef.close(true);
  }
}
