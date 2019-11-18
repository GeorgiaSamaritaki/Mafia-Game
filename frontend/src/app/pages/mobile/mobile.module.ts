import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileComponent } from './mobile.component';
import { MobileRoutingModule } from './mobile.routing';
import { MainpageRoutingModule } from './mainpage/mainpage.routing';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { InfoComponent } from './mainpage/info/info.component';
import { HomeComponent } from './mainpage/home/home.component';
import { VotingComponent } from './mainpage/voting/voting.component';


@NgModule({
  declarations: [
    MobileComponent,
    LoginComponent,
    // MainpageComponent,
    // InfoComponent,
    // HomeComponent,
    // VotingComponent
  ],
  imports: [
    CommonModule,
    MobileRoutingModule,
    // MainpageRoutingModule
  ]
})
export class MobileModule { }
