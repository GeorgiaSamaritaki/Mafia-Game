import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './pages/SmartTv/main/main.component';
import { MobileMainComponent } from './pages/Mobile/mobile-main/mobile-main.component';

const routes: Routes = [
  
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
  { path: 'SmartTV/main', component: MainComponent },
  { path: 'Mobile/main', component: MobileMainComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
