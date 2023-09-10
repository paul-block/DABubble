import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';


@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {

  images = [ '/assets/img/small_avatar/avatar (1).png', '/assets/img/small_avatar/avatar (2).png', '/assets/img/small_avatar/avatar (3).png', '/assets/img/small_avatar/avatar (4).png', '/assets/img/small_avatar/avatar (5).png', '/assets/img/small_avatar/avatar (6).png' ]
  detailsVisible: boolean = false;
  editDetailsVisible: boolean = false;
  editAvatarVisible: boolean = false
  file_error: boolean;
  uploadProgress: number = 0;
  selectedFile: File = null;
  imageUrl: string;
  current_imageUrl: string;
  current_username: string = this.authService.userData.user_name;
  current_email: string = this.authService.userData.email;

  constructor(
    public authService: AuthenticationService,
    private dialog: MatDialog,
    private storage: AngularFireStorage,
    public fsDataThreadService: FirestoreThreadDataService,
    public dialogRef: MatDialogRef<ProfileMenuComponent>,
    public uploadService: UploadService
  ) { }

  signOut() {
    this.authService.signOut();
    this.dialog.closeAll();
    this.fsDataThreadService.thread_open = false
  }


  toggleDetails() {
    if (this.fsDataThreadService.detailsVisible) {
      this.fsDataThreadService.detailsVisible = false
      this.onNoClick()
    }
    this.detailsVisible = !this.detailsVisible;
  }


  toggleEditDetails() {
    this.editDetailsVisible = !this.editDetailsVisible;
  }

  updateUserDetails() {
    this.authService.updateUserDetails(this.current_username, this.current_email);
    this.dialog.closeAll();
    this.fsDataThreadService.detailsVisible = false
  }


  editAvatarImage() {
    this.current_imageUrl = this.authService.userData.avatar
    this.editDetailsVisible = false
    this.editAvatarVisible = true
    this.detailsVisible = false
  }


  closeEditAvatar() {
    
    this.editAvatarVisible = false
    this.editDetailsVisible = true
  }


  onFileSelected($event: any) {
    this.file_error = false;
    this.selectedFile = $event.target.files[0];
    if (this.selectedFile && this.selectedFile.type.startsWith('image/')) this.uploadImage();
    else this.file_error = true;
  }


  uploadImage() {
    this.file_error = false
    const filePath = this.authService.userData.uid + '/' + 'avatar_' + this.selectedFile.name;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile);
    uploadTask.percentageChanges().subscribe(progress => {
      this.uploadProgress = progress;
    });
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(downloadURL => {
          this.imageUrl = downloadURL
          this.current_imageUrl = downloadURL
        });
      })
    ).subscribe();
  }


  showPreviewAvatar(imgUrl: string) {
    this.current_imageUrl = imgUrl;
  }

  
  saveNewAvatar() {
    const decodedLink = decodeURIComponent(this.authService.userData.avatar);  
    const parts = decodedLink.split('/');
    const filename = parts[parts.length - 1].split('?')[0];
    let path = this.authService.userData.uid + '/' + filename;
    this.file_error = false
    this.authService.setAvatarImage(this.current_imageUrl)
    this.dialogRef.close();
    if (!this.images.includes('/assets/img/small_avatar/' + filename )) this.uploadService.deleteFile(path)
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
}
