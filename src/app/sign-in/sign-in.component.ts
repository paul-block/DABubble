import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from 'services/channel.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  email: string;
  emailFocus: boolean = false;
  validEmail: boolean = false;
  password: string = '';
  form_valid: boolean = false;

  constructor(
    public authService: AuthenticationService,
    private router: Router,
    public channelService: ChannelService,
  ) { }


  /**
   * logs the user in with googlaccount. If it is a new user, he will be redirected to the choose-avatar component
   */
  async signInWithGoogleAcc() {
    await this.authService.GoogleAuth();
    if (this.authService.signIn_successful) {
      if (this.authService.googleUser_exist) {
        setTimeout(() => this.router.navigateByUrl('/main'), 1900);
      }
      else setTimeout(() => this.router.navigateByUrl('/choose-avatar'), 1900);
    }
  }


  /**
   * logs the user in with email and password and redirect to the main component.
   */
  async signInWithPassword() {
    if (this.password.length > 7 && this.validEmail && !this.authService.signIn_error) {
      await this.authService.SignIn(this.email, this.password);
      if (this.authService.signIn_successful) setTimeout(() => this.router.navigateByUrl('/main'), 1900);
    }
  }



  /**
   * logs the user as a guest in
   */
  guestLogin() {
    this.authService.guestSignIn();
    setTimeout(() => this.router.navigateByUrl('/main'), 1900);
  }


  /**
   * checks if email is valid
   * 
   * @param value text from inputfield
   */
  dataChanged(value: string) {
    this.validEmail = this.regexEmail.test(value);
  }
}
