import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotsRoutingModule } from './bots.routing';
import { BotsComponent } from './bots.component';

@NgModule({
  declarations: [
    BotsComponent
  ],
  imports: [
    CommonModule,
    BotsRoutingModule
  ]
})
export class BotsModule { }
