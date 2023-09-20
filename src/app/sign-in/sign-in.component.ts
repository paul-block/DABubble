import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from 'services/channel.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  email: string
  emailFocus: boolean = false
  emailError: boolean = false
  password: string = ''
  form_valid: boolean = false

  constructor(public authenticationService: AuthenticationService,
    private router: Router,
    public channelService: ChannelService,
    public messageService: MessagesService
  ) { }


  async signIn() {
    await this.authenticationService.GoogleAuth()
    if (this.authenticationService.signIn_successful) {
      if (this.authenticationService.googleUser_exist) {
        setTimeout(() => this.router.navigateByUrl('/main'), 1900);
        this.channelService.loadStandardChannel();
        await this.messageService.getMessages()
        setTimeout(() => this.router.navigateByUrl('/main'), 1900);
      }
      else setTimeout(() => this.router.navigateByUrl('/choose-avatar'), 1900);
    }
  }

  async signInWithPassword() {
    if (this.password.length > 7 && this.emailError && !this.authenticationService.signIn_error) {
      await this.authenticationService.SignIn(this.email, this.password)
      if (this.authenticationService.signIn_successful) {
        setTimeout(() => this.router.navigateByUrl('/main'), 1900);
      }
    }
  }

  guestLogin() {
    this.authenticationService.guestSignIn()
   
    this.channelService.loadStandardChannel()
    this.messageService.getMessages().then(() => {
      setTimeout(() => this.router.navigateByUrl('/main'), 1900);
    });
    
  }


  dataChanged(value: string) {
    this.emailError = this.regexEmail.test(value)
  }
}
