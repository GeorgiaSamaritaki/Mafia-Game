import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { MainComponent } from './pages/SmartTv/main/main.component';
import { MobileMainComponent } from './pages/Mobile/mobile-main/mobile-main.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    MobileMainComponent
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
