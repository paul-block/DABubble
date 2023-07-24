import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  emailFocus: boolean = false
  name = ''
  password = ''
  email = ''
  emailError: boolean = false
  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  formValid: boolean = false
  nameFocus: boolean = false
  passwordFocus: boolean = false
  validPassword: boolean = false
  match:boolean = false
  matchPassword: string
  passwordConfirmed:boolean = false



  constructor(public authenticationService: AuthenticationService) { }


  dataChanged(value: any, inputfield: string) {
    if (inputfield == 'email') {
      this.emailError = this.regexEmail.test(value)
    }
    this.validateForm()
  }

  hasNumber() {
    return /[0-9]/.test(this.password);
  }


  hasSpecialChr() {
    return /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]/.test(this.password);
  }


  hasValidLength() {
    return /^.{8,32}$/.test(this.password);
  }


  hasUppercase() {
    return /[A-Z]/.test(this.password);
  }

  validateForm() {
    if (this.password === this.matchPassword) this.passwordConfirmed = true
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase() && this.name.length > 2 && this.emailError && this.passwordConfirmed) this.formValid = true
  }


  signUp() {
    if (this.formValid) this.authenticationService.SignUp(this.email, this.password)
  }
}
