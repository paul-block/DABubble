import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  constructor(public authenticationService: AuthenticationService) {}

  email: string
  emailFocus: boolean
  emailError: boolean
  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');

  dataChanged(value:string){
    this.emailError = this.regexEmail.test(value)
  }


  sendMail() {
    if(this.emailError) this.authenticationService.ForgotPassword(this.email)
  }
}
