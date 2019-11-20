import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomescreenTvComponent } from './homescreen-tv.component';
import { HomescreenTvRoutingModule } from './homescreen-tv.routing';


@NgModule({
  declarations: [
    HomescreenTvComponent
  ],
  imports: [
    CommonModule,
    HomescreenTvRoutingModule
  ]
})
export class HomescreenTvModule { }
