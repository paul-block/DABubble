import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { of } from 'rxjs';



@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {

  images = ['/assets/img/big_avatar/80. avatar interaction.png', '/assets/img/big_avatar/80. avatar interaction (1).png', '/assets/img/big_avatar/80. avatar interaction (2).png', '/assets/img/big_avatar/80. avatar interaction (3).png', '/assets/img/big_avatar/80. avatar interaction (4).png', '/assets/img/big_avatar/80. avatar interaction (5).png']
  detailsVisible: boolean = false;
  editDetailsVisible: boolean = false;
  editAvatarVisible: boolean = false
  file_error: boolean;
  uploadProgress: number = 0;
  selectedFile: File = null;
  imageUrl: string;


  constructor(public authService: AuthenticationService, private dialog: MatDialog, private storage: AngularFireStorage) {
  }

  signOut() {
    this.authService.signOut();
    this.dialog.closeAll();
  }

  toggleDetails() {
    this.detailsVisible = !this.detailsVisible;
  }

  toggleEditDetails() {
    this.editDetailsVisible = !this.editDetailsVisible;
  }

  updateUserDetails() {
    this.authService.updateUserDetails(this.authService.userData.user_name, this.authService.userData.email);
    this.dialog.closeAll();
  }


  editAvatarImage() {
    this.editDetailsVisible = false
    this.editAvatarVisible = true
    this.detailsVisible = false
  }


  closeEditAvatar() {
    this.editAvatarVisible = false
    this.editDetailsVisible = true
  }


  async onFileSelected(event: any) {
    this.file_error = false
    this.selectedFile = event.target.files[0];
    if (this.selectedFile && this.selectedFile.type.startsWith('image/')) this.uploadImage();
    else this.file_error = true
  }


  setAvatar(image: string) {
    this.file_error = false
    this.authService.setAvatarImage(image)
    this.imageUrl = image
  }


  uploadImage() {
    this.file_error = false
    const filePath = this.authService.userData.uid + '/' + this.selectedFile.name;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile);
    uploadTask.percentageChanges().subscribe(progress => {
      this.uploadProgress = progress;
    });
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(downloadURL => {
          this.setAvatar(downloadURL)
        });
      })
    ).subscribe(
      error => {
        this.file_error = true
      }
    );
  }
}
