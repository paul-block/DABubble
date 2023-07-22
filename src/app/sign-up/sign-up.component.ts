import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

name =''
password = ''
email = ''
 

  constructor( public authenticationService: AuthenticationService) { }


  dataChanged(change: any) {
    console.log(change);
    
  }
}
