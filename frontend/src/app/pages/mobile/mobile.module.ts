import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileComponent } from './mobile.component';
import { MobileRoutingModule } from './mobile.routing';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';


@NgModule({
  declarations: [
    MobileComponent,
    LoginComponent,
    // MainpageComponent
  ],
  imports: [
    CommonModule,
    MobileRoutingModule,
  ]
})
export class MobileModule { }
