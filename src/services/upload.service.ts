import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, catchError, finalize, of } from 'rxjs';
import { FirestoreThreadDataService } from './firestore-thread-data.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  selectedFile: File = null;
  uploadProgressArray: number[] = [0];
  upload_array = {
    file_name: [],
    download_link: [],
    file_type: [],
    file_extension: []
  }
  file = []
  file_images = ['exe', 'xls', 'csv', 'txt', 'ppt', 'zip', 'avi', 'css', 'doc', 'html', 'js', 'jpg', 'json', 'mp3', 'pdf', 'png', 'xml', 'svg', 'file']

  constructor(
    public authenticationService: AuthenticationService,
    private storage: AngularFireStorage,
    public fsDataThreadService: FirestoreThreadDataService,
  ) {
    this.emptyUploadArray()
  }


  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
    
    if (this.selectedFile && this.checkFileSize(this.selectedFile)) {
      this.file.push(this.selectedFile)
      this.upload_array.file_type.push(this.selectedFile.type)
      this.upload_array.file_name.push(this.selectedFile.name)
      this.upload_array.file_extension.push(this.checkFileExtension(this.selectedFile))
    }
  }


  checkFileSize(file: File) {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size <= maxSizeInBytes) {
      return true
    } else {
      alert("Die ausgewählte Datei ist zu groß. Maximale Dateigröße: 5 MB.");
      return false
    }
  }


  checkFileName(fileName: string) {
    const fileExtension = fileName.split('.').pop();
    if (this.file_images.includes(fileExtension)) {
      const parts = fileName.split('.');   
      parts.pop();                         
      const nameWithoutExtension = parts.join('.');
      return nameWithoutExtension 
    }
    else return fileName
  }


  checkFileExtension(file: File) {
    const fileExtension = file.name.split('.').pop();
    const index = this.file_images.indexOf(fileExtension)
    if (index == -1) return 'file'
    else return fileExtension
  }


  async prepareUploadfiles() {
    for (let i = 0; i < this.upload_array.file_name.length; i++) {
      const file = this.file[i];
      await this.uploadFile(file, i)
    }
  }


  async uploadFile(file: File, i: number) {
    const filePath = this.authenticationService.userData.uid + '/' + file.name;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);
    uploadTask.percentageChanges().subscribe(progress => {
      this.uploadProgressArray[i] = progress;
    });

    try {
      await uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          try {
            const downloadURL = await fileRef.getDownloadURL().toPromise();
            this.upload_array.download_link[i] = downloadURL
            console.log(this.upload_array.download_link);
          } catch (error) {
            console.error("Error getting download URL:", error);
          }
        }),
        catchError(error => {
          console.error("Error uploading file:", error);
          return of(null);
        })
      ).toPromise();
      console.log('Upload erfolgreich');
    } catch (error) {
      console.error("Error during upload:", error);
      this.emptyUploadArray()
    }
  }


  emptyUploadArray() {
    this.uploadProgressArray = []
    this.upload_array.download_link = []
    this.upload_array.file_name = []
    this.upload_array.file_extension = []
    this.upload_array.file_type = []
    this.file = []
  }


  deleteFile(filePath: string): Observable<void> {
    const fileRef = this.storage.ref(filePath);
    return fileRef.delete();
  }


  removeFile(i: number) {
    this.upload_array.file_name.splice(i, 1)
    this.upload_array.download_link.splice(i, 1)
    this.upload_array.file_type.splice(i, 1)
    this.upload_array.file_extension.splice(i, 1)
    this.file.splice(i, 1)
    this.selectedFile = null;
  }


  deleteSelectedFile(filename: string, i: number, k: number) {
    let filePath = this.authenticationService.userData.uid + '/' + filename
    this.deleteFile(filePath)
    this.fsDataThreadService.updateThread(i, k)
  }


  downloadFile(path: string | URL) {
    window.open(path, '_blank');
  }
}
