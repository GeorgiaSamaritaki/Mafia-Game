import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketEventsComponent } from './socket-events.component';
import { SocketEventsRoutingModule } from './socket-events.routing';
import { MainComponent } from './main/main.component';
import { MobileMainComponent } from './mobile-main/mobile-main.component';

@NgModule({
  imports: [
    CommonModule,
    SocketEventsRoutingModule
  ],
  declarations: [SocketEventsComponent, MainComponent, MobileMainComponent]
})
export class SocketEventsModule { }
