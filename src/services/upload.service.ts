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
  }
  file = []

  constructor(
    public authenticationService: AuthenticationService,
    private storage: AngularFireStorage,
    public fsDataThreadService: FirestoreThreadDataService,
  ) { }


  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.file.push(this.selectedFile)
      this.upload_array.file_name.push(this.selectedFile.name)
    }
  }


  async prepareUploadfiles() {
    console.log(this.upload_array);
    
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
      this.uploadProgressArray[i]  = progress;
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
          // Führe hier geeignete Fehlerbehandlung durch
          return of(null); // Gibt ein Observable mit null zurück, um den Fehler anzuzeigen
        })
      ).toPromise();
      
      // Der Code hier wird erst nach erfolgreichem Upload ausgeführt
    } catch (error) {
      console.error("Error during upload:", error);
      this.emptyUploadArray()
    }
  }
  
  
  emptyUploadArray() {
    this.uploadProgressArray = []
    this.upload_array.download_link = []
    this.upload_array.file_name = []
    this.file = []
  }


  deleteFile(filePath: string, i:number, k:number): Observable<void> {
    const fileRef = this.storage.ref(filePath);
    return fileRef.delete();
    
  }


  removeFile(i: number) {
    this.upload_array.file_name.splice(i, 1)
    this.upload_array.download_link.splice(i, 1)
  }


  deleteSelectedFile(filename: string, i:number, k:number) {
    let filePath = this.authenticationService.userData.uid + '/' + filename
    this.deleteFile(filePath, i, k)
    this.fsDataThreadService.updateThread(i, k)
  }


  downloadFile(path: string | URL) {
    window.open(path, '_blank');
  }
}
