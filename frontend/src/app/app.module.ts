import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { SmartTvComponent } from './pages/smart-tv/smart-tv.component';
import { AugmentedTableComponent } from './pages/augmented-table/augmented-table.component';
import { InteractiveWallComponent } from './pages/interactive-wall/interactive-wall.component';

@NgModule({
  declarations: [
    AppComponent,
    SmartTvComponent,
    AugmentedTableComponent,
    InteractiveWallComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
