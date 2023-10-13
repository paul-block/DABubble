import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {

  password: string = ''
  password_2: string = ''
  pwFocus_2: boolean
  pwFocus: boolean
  passwordConfirmed: boolean
  formValid: boolean
  code: string
  codeVerified: boolean;
  resetFailed: boolean = false;

  constructor(private route: ActivatedRoute, private afAuth: AngularFireAuth) { }

/**
 * Initializes the component.
 * Retrieves and verifies the password reset code from the query parameters of the URL.
 * If the code is valid, the `codeVerified` property is set to true.
 */
  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.code = params['oobCode'];
      this.afAuth.verifyPasswordResetCode(this.code)
        .then(email => {
          this.codeVerified = true;
        })
        .catch(error => {
          console.log(error);
        })
    })
  }


/**
 * Handler for when data changes in the password and password confirmation fields.
 * Updates the `password` or `password_2` properties based on the provided password identifier.
 * Calls the form validation method.
 *
 * @param {string} value - The new value of the password or password confirmation field.
 * @param {string} pw - Identifier for which password field was changed ('pw1' for password, 'pw2' for password confirmation).
 */
  dataChanged(value: string, pw: string) {
    if (pw == 'pw1') this.password = value
    if (pw == 'pw2') this.password_2 = value
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
    if (this.password === this.password_2) this.passwordConfirmed = true
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase() && this.passwordConfirmed) this.formValid = true
  }


  /**
   * sets the user's new password
   * 
   */
  resetPassword() {
    if (!this.formValid) return;
    this.afAuth.confirmPasswordReset(this.code, this.password)
      .then(resp => {
        console.log(resp);
      })
      .catch(error => {
        console.log(error);
        this.resetFailed = true;
      });
  }
}





