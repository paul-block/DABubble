import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  animationStart: boolean = false
  animationLogo: boolean = false
  d_none: boolean = false
  active: boolean = false

  constructor(private firestoreService: AuthenticationService, private router: Router) {

  }

  ngOnInit(): void {
    console.log(this.firestoreService.userData);
    
    setTimeout(() => this.animationStart = true, 1000);
    setTimeout(() => this.animationLogo = true, 2000);
    setTimeout(() => this.d_none = true, 2900);
    this.router.navigateByUrl('/sign-in')
  }

}
