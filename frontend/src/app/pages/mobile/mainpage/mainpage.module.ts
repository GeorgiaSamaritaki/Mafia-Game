import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainpageComponent } from './mainpage.component';
import { MainpageRoutingModule } from './mainpage.routing';
import { InfoComponent } from './info/info.component';
import { HomeComponent } from './home/home.component';
import { VotingComponent } from './voting/voting.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    MainpageComponent,
    InfoComponent,
    HomeComponent,
    VotingComponent
  ],
  imports: [
    CommonModule,
    MainpageRoutingModule,
    MatTabsModule
  ]
})
export class MainpageModule { }
