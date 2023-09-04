import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-avatar',
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {

  uploadProgress: number = 0;
  selectedFile: File = null;
  images = [ '/assets/img/small_avatar/avatar (1).png', '/assets/img/small_avatar/avatar (2).png', '/assets/img/small_avatar/avatar (3).png', '/assets/img/small_avatar/avatar (4).png', '/assets/img/small_avatar/avatar (5).png', '/assets/img/small_avatar/avatar (6).png' ]
  imageUrl: string = '/assets/img/big_avatar/81. Profile.png'
  file_error: boolean;

  constructor(
    public authenticationService: AuthenticationService, private storage: AngularFireStorage, private router: Router) {}


    onFileSelected(event:any) {
      this.file_error = false
      this.selectedFile = event.target.files[0];
      if (this.selectedFile && this.selectedFile.type.startsWith('image/')) {
        this.uploadImage();
      } else {
        this.file_error = true
      }
    }
    

    setAvatar(image:string) {
      this.authenticationService.setAvatarImage(image)
      this.imageUrl = image
    }


    uploadImage() {
      this.file_error = false
      const filePath = this.authenticationService.userData.uid + '/'  + 'avatar_' + this.selectedFile.name;
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


    goToMain() {
      this.router.navigateByUrl('/main');
    }
}
