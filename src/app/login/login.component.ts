import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor( private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.firestoreService.updateData();
  }
 
}
