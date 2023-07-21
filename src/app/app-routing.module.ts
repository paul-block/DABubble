import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  {path: '', component: LoginComponent, children: [
    {path: 'signin', component: SignInComponent}
  ]},
  {path: 'main', component: MainComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
