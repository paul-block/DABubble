import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  animationStart: boolean = false
  animationLogo: boolean = false
  d_none:boolean = false

  constructor( private firestoreService: FirestoreService, private router: Router) {
   
  }

  ngOnInit(): void {
    setTimeout(() =>  this.animationStart = true, 1000);
    setTimeout(() =>  this.animationLogo = true, 2000);
    setTimeout(() =>  this.d_none = true, 2900);
    this.router.navigateByUrl('/signin')
  }
 
}
