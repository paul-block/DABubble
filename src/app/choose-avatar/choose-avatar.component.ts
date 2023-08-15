import { Component } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
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
  images = [ '/assets/img/big_avatar/80. avatar interaction.png', '/assets/img/big_avatar/80. avatar interaction (1).png', '/assets/img/big_avatar/80. avatar interaction (2).png', '/assets/img/big_avatar/80. avatar interaction (3).png', '/assets/img/big_avatar/80. avatar interaction (4).png', '/assets/img/big_avatar/80. avatar interaction (5).png' ]
  imageUrl: string = '/assets/img/big_avatar/81. Profile.png'

  constructor(
    public authenticationService: AuthenticationService, private storage: AngularFireStorage, private router: Router) {}


    onFileSelected(event:any) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile && this.selectedFile.type.startsWith('image/')) {
        this.uploadImage();
      } else {
        console.log('Ungültiger Dateityp. Bitte wähle eine Bilddatei aus.');
      }
    }
    

    setAvatar(image:string) {
      this.authenticationService.setAvatarImage(image)
      this.imageUrl = image
      console.log(image);
      
    }


    uploadImage() {
      const filePath = this.authenticationService.userData.uid + '/' + this.selectedFile.name;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);
      uploadTask.percentageChanges().subscribe(progress => {
        this.uploadProgress = progress;
      });
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(downloadURL => {
            console.log('Bild erfolgreich hochgeladen', downloadURL);
            this.setAvatar(downloadURL)
          });
        })
      ).subscribe();
    }


    goToMain() {
      this.router.navigateByUrl('/main');
    }
}
