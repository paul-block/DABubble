import { Component, ElementRef  } from '@angular/core';
import { getFirestore, collection, getDocs } from '@angular/fire/firestore';
import { HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';



@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
  db = getFirestore();
  showResults = false;
  isLoading = false;
  searchValue = '';

  usersSet: Set<string> = new Set();
  channelsSet: Set<string> = new Set();
  filteredChannelMessagesSet: Set<string> = new Set();

  filteredUsers: Array<string> = [];
  filteredChannels: Array<string> = [];
  filteredChannelMessages: Array<string> = [];

  profileRef;
  profileRefOpen = false;

  constructor(private elementRef: ElementRef, private dialog: MatDialog) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const inputElement = this.elementRef.nativeElement.querySelector('.input-container input');
    const searchContainer = this.elementRef.nativeElement.querySelector('.search-container');

    if (inputElement.contains(event.target) || searchContainer && searchContainer.contains(event.target)) {
      return;
    }
    this.showResults = false;
  }

  @HostListener(':click', ['$event'])
  handleClickInside(event: Event) {
    const resultRows = this.elementRef.nativeElement.querySelectorAll('.result-row span');
  
    for (let span of resultRows) {
      if (span.contains(event.target)) {
        this.searchValue = span.textContent; 
        event.stopPropagation(); 
        this.onSearchValueChange()
        return;
      }
    }
  }

  async onSearchValueChange() {
    if (this.searchValue.length == 0) this.showResults = false; 
    else {

    this.isLoading = true;
    this.showResults = true; 

    this.usersSet.clear();
    this.channelsSet.clear();
    this.filteredChannelMessagesSet.clear();
    this.filteredChannels = [];
    this.filteredUsers = [];
    this.filteredChannelMessages = [];
  
    await this.search('channels');
    await this.search('users');
    await this.searchMessagesInChannels();

    this.filteredChannels = Array.from(this.channelsSet).filter(channel => 
      channel.toLowerCase().startsWith(this.searchValue)
    );
    this.filteredUsers = Array.from(this.usersSet).filter(user =>
      user.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
    this.filteredChannelMessages = Array.from(this.filteredChannelMessagesSet);

    this.isLoading = false;
    this.show();
}    
}

    async search(collectionName: string) {
      const collectionRef = collection(this.db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      querySnapshot.forEach((doc) => {
        if (collectionName === 'channels') this.channelsSet.add(doc.data().channelName);
        if (collectionName === 'users') this.usersSet.add(doc.data().user_name);
      });
    }


    async searchMessagesInChannels() {
      const channelsRef = collection(this.db, 'channels');
      const channelsSnapshot = await getDocs(channelsRef);
  
      for (let channelDoc of channelsSnapshot.docs) {
          const channelName = channelDoc.data().channelName;
          const messagesRef = collection(channelDoc.ref, 'channel_messages');
          const messagesSnapshot = await getDocs(messagesRef);
          
          messagesSnapshot.docs.forEach(messageDoc => {
              const message = messageDoc.data().message;
              const messageSender = messageDoc.data().user_name;
  
              if (message.toLowerCase().startsWith(this.searchValue.toLowerCase())) {
                  const combinedMessage = `${message} in #${channelName} von: ${messageSender}`;
                  this.filteredChannelMessagesSet.add(combinedMessage);
              }
          });
      }
  }
  
  show() {
    if (this.searchValue.length > 0 && this.filteredChannels.length > 0 ||  
        this.searchValue.length > 0 && this.filteredUsers.length > 0 || 
        this.searchValue.length > 0 && this.filteredChannelMessages.length > 0) {
          this.showResults = true; 
        } else this.showResults = false;
      }

      openProfile() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.panelClass = 'add-channel-dialog';
        dialogConfig.data = { user_name: 'Test Name', user_email: 'testhausen@test.com' };

        this.dialog.closeAll();
      
        this.profileRef = this.dialog.open(DialogProfileComponent, dialogConfig);
        this.profileRefOpen = true;
      
        this.profileRef.afterClosed().subscribe(() => {
          this.profileRefOpen = false;
        });
      }
}
