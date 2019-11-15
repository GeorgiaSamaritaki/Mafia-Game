import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractiveWallComponent } from './interactive-wall.component';
import { InteractiveWallRoutingModule } from './interactive-wall.routing';
 
@NgModule({
  declarations: [
    InteractiveWallComponent,
  ],
  imports: [
    CommonModule,
    InteractiveWallRoutingModule
  ]
})
export class InteractiveWallModule { }
