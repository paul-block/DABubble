import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { MainComponent } from './main/main.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

const routes: Routes = [
  {path: '', component: StartScreenComponent, children: [
    {path: 'sign-in', component: SignInComponent},
    {path: 'sign-up', component: SignUpComponent}
  ]},
  {path: 'main', component: MainComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
