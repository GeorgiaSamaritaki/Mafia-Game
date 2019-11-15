import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartTvRoutingModule } from './smart-tv.routing';
import { SmartTvComponent } from './smart-tv.component';


@NgModule({
  declarations: [
    SmartTvComponent
  ],
  imports: [
    CommonModule,
    SmartTvRoutingModule
  ]
})
export class SmartTvModule { }
