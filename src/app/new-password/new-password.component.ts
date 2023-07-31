import { Component } from '@angular/core';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent {

  password:string = ''
  password_2:string = ''
  pwFocus_2:boolean
  pwFocus:boolean
  passwordConfirmed:boolean 
  formValid:boolean


  dataChanged(value:string, pw:string) {
    if(pw == 'pw1') this.password = value
    if(pw == 'pw2') this.password_2 = value
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
    if (this.password === this.password_2) this.passwordConfirmed = true
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase()  && this.passwordConfirmed) this.formValid = true
  }

}


