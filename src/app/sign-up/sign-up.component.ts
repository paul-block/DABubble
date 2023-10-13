import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  emailFocus: boolean = false
  name: string = ''
  password: string = ''
  email: string = ''
  emailError: boolean = false
  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  formValid: boolean = false
  nameFocus: boolean = false
  passwordFocus: boolean = false
  validPassword: boolean = false
  match: boolean = false
  matchPassword: string
  passwordConfirmed: boolean = false

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
  ) { }


/**
 * Handler for when data changes in the password and password confirmation fields.
 * Updates the `password` or `password_2` properties based on the provided password identifier.
 * Calls the form validation method.
 *
 * @param {string} value - The new value of the password or password confirmation field.
 * @param {string} pw - Identifier for which password field was changed ('pw1' for password, 'pw2' for password confirmation).
 */
  dataChanged(value: any, inputfield: string) {
    if (inputfield == 'email') {
      this.emailError = this.regexEmail.test(value)
    }
    this.validateForm()
  }

/**
 * Checks if the password contains a number.
 * @returns {boolean} - true if the password contains a number, otherwise false.
 */
  hasNumber() {
    return /[0-9]/.test(this.password);
  }

/**
 * Checks if the password contains a special character.
 * @returns {boolean} - true if the password contains a special character, otherwise false.
 */
  hasSpecialChr() {
    return /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]/.test(this.password);
  }

/**
 * Checks if the password has a valid length between 8 and 32 characters.
 * @returns {boolean} - true if the password has a valid length, otherwise false.
 */
  hasValidLength() {
    return /^.{8,32}$/.test(this.password);
  }

/**
 * Checks if the password contains an uppercase letter.
 * @returns {boolean} - true if the password contains an uppercase letter, otherwise false.
 */
  hasUppercase() {
    return /[A-Z]/.test(this.password);
  }

/**
  * Checks whether the form has been completely filled out
  */
  validateForm() {
    if (this.password === this.matchPassword) this.passwordConfirmed = true
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase() && this.name.length > 2 && this.emailError && this.passwordConfirmed) this.formValid = true
  }


/**
  * creates a new user account and redirects to the choose avatar component
  */
  async signUp() {
    this.authenticationService.userName = this.name
    if (this.formValid) await this.authenticationService.SignUp(this.email, this.password)
    if (this.authenticationService.signUp_successful) {
      setTimeout(() => this.router.navigateByUrl('/choose-avatar'), 1900);
    }
  }
}

