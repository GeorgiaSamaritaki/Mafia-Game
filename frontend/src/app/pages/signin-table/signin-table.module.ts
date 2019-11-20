import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninTableComponent } from './signin-table.component';
import {SigninTableRoutingModule} from './signin-table.routing';



@NgModule({
  declarations: [
    SigninTableComponent
  ],
  imports: [
    CommonModule,
    SigninTableRoutingModule
  ]
})
export class SigninTableModule { }
