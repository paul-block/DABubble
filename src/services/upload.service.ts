import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, catchError, finalize, of } from 'rxjs';
import { FirestoreThreadDataService } from './firestore-thread-data.service';
import { MessagesService } from './messages.service';

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
  chat_section: string

  constructor(
    public authenticationService: AuthenticationService,
    private storage: AngularFireStorage,
    public fsDataThreadService: FirestoreThreadDataService,
    public msgService: MessagesService,
  ) {
    this.emptyUploadArray()
  }

/**
 * Triggered when a file is selected from the input.
 * @param {any} event - The file input change event.
 */
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0]
    if (this.selectedFile && this.checkFileSize(this.selectedFile)) {
      this.file.push(this.selectedFile)
      this.upload_array.file_type.push(this.selectedFile.type)
      this.upload_array.file_name.push(this.selectedFile.name)
      this.upload_array.file_extension.push(this.checkFileExtension(this.selectedFile))
    }
  }

/**
 * Checks if the size of the given file is within the allowed limit.
 * @param {File} file - The file to be checked.
 * @returns {boolean} True if the file size is acceptable, otherwise false.
 */
  checkFileSize(file: File) {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size <= maxSizeInBytes) {
      return true
    } else {
      alert("Die ausgewählte Datei ist zu groß. Maximale Dateigröße: 5 MB.");
      return false
    }
  }

/**
 * Checks the given file name and returns its name without the extension if the file is an image.
 * @param {string} fileName - Name of the file.
 * @returns {string} The file name without the extension if it's an image, otherwise the original file name.
 */
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

/**
 * Determines the file type or extension of the given file.
 * @param {File} file - The file to be checked.
 * @returns {string} The file extension or 'file' for unknown types.
 */
  checkFileExtension(file: File) {
    const fileExtension = file.name.split('.').pop();
    const index = this.file_images.indexOf(fileExtension)
    if (index == -1) return 'file'
    else return fileExtension
  }

/**
 * Checks if there are any files ready for upload and prepares them.
 */
  async checkForUpload() {
    if (this.upload_array.file_name.length > 0) await this.prepareUploadfiles();
    this.msgService.upload_array = this.upload_array;
  }

/**
 * Prepares multiple files for upload.
 */
  async prepareUploadfiles() {
    for (let i = 0; i < this.upload_array.file_name.length; i++) {
      const file = this.file[i];
      await this.uploadFile(file, i)
    }
  }

/**
 * Uploads the given file to the storage.
 * @param {File} file - The file to be uploaded.
 * @param {number} i - Index to track the upload progress in the uploadProgressArray.
 */
  async uploadFile(file: File, i: number) {
    return new Promise<void>(async (resolve, reject) => {
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
              this.upload_array.download_link[i] = downloadURL;
              console.log('Upload erfolgreich');
              resolve();
            } catch (error) {
              console.error("Error getting download URL:", error);
              reject(error);
            }
          }),
          catchError(error => {
            console.error("Error uploading file:", error);
            reject(error);
            return of(null);
          })
        ).toPromise();
      } catch (error) {
        console.error("Error during upload:", error);
        this.emptyUploadArray();
        reject(error);
      }
    });
  }

/**
 * Clears all data from the upload arrays.
 */
  emptyUploadArray() {
    this.uploadProgressArray = []
    this.upload_array.download_link = []
    this.upload_array.file_name = []
    this.upload_array.file_extension = []
    this.upload_array.file_type = []
    this.file = []
  }

/**
 * Deletes the specified file from the storage.
 * @param {string} filePath - Path to the file in the storage.
 * @returns {Observable<void>} Observable indicating the completion of the delete operation.
 */
  deleteFile(filePath: string): Observable<void> {
    const fileRef = this.storage.ref(filePath);
    return fileRef.delete();
  }

/**
 * Removes the file from the local upload arrays and resets the selectedFile.
 * @param {number} i - Index of the file in the upload arrays.
 */
  removeFile(i: number) {
    this.upload_array.file_name.splice(i, 1)
    this.upload_array.download_link.splice(i, 1)
    this.upload_array.file_type.splice(i, 1)
    this.upload_array.file_extension.splice(i, 1)
    this.file.splice(i, 1)
    this.selectedFile = null;
  }

/**
 * Deletes the selected file both from the storage and the local arrays.
 * @param {string} filename - Name of the file to be deleted.
 * @param {number} i - Index of the file in the chat messages.
 * @param {number} k - Index of the file in the upload arrays.
 * @param {string} section - Section indicating whether it's the 'mainChat' or another section.
 */
  deleteSelectedFile(filename: string, i: number, k: number, section: string) {
    let filePath = this.authenticationService.userData.uid + '/' + filename;
    this.deleteFile(filePath);
    if (section === 'mainChat') {
      this.msgService.updateUploadedFiles(i, k)
    } else {
      this.fsDataThreadService.updateThread(i, k);
    }
  }

/**
 * Opens the given file path in a new browser tab for downloading.
 * @param {string | URL} path - The path or URL of the file.
 */
  downloadFile(path: string | URL) {
    window.open(path, '_blank');
  }
}
