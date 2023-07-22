import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  constructor(public authenticationService: AuthenticationService, private router: Router) { }


  async signIn() {
    await this.authenticationService.GoogleAuth()
    if (this.authenticationService.signIn_successful) {
      setTimeout(() => this.router.navigateByUrl('/main'), 1900);
    }
  }
}
