import { Component, ElementRef  } from '@angular/core';
import { getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})

export class SearchbarComponent {
  db = getFirestore();
  showResults = false;
  searchValue = '';
  currentCategory = '';  
  items: Array<string> = [];
  filteredItems: Array<string> = [];
  showAll = false;

  constructor(private elementRef: ElementRef) {

  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const inputElement = this.elementRef.nativeElement.querySelector('.input-container input');
    const searchContainer = this.elementRef.nativeElement.querySelector('.search-container');

    if (inputElement.contains(event.target) || searchContainer.contains(event.target)) {
      return;
    }

    this.clear();
    // this.searchValue = '';
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

  onSearchValueChange() {
    this.filteredItems = this.items.filter(item => 
      item.toLowerCase().startsWith(this.searchValue.toLowerCase())
    );
    if (this.filteredItems.length > 0) this.showAll = false;
    else this.showAll = true;
  }

  async search(collectionName: string) {
    this.showAll = true;
    this.searchValue = '';
    this.clear();
    this.currentCategory = collectionName;
    const collectionRef = collection(this.db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    querySnapshot.forEach((doc) => {
      if (collectionName === 'channels') this.items.push(doc.data().channelName);
      if (collectionName === 'users') this.items.push(doc.data().user_name);
    });
  }

  clear() {
    this.filteredItems = [];
    this.items = [];
  }
}
