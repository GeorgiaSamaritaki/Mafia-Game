import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileComponent } from './mobile.component';
import { MobileRoutingModule } from './mobile.routing';


@NgModule({
  declarations: [
    MobileComponent
  ],
  imports: [
    CommonModule,
    MobileRoutingModule
  ]
})
export class MobileModule { }
