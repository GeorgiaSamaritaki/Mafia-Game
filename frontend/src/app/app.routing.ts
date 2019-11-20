import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  
  { path: 'augmented-table', loadChildren: () => import('./pages/augmented-table/augmented-table.module').then(m => m.AugmentedTableModule) },
  { path: 'interactive-wall', loadChildren: () => import('./pages/interactive-wall/interactive-wall.module').then(m => m.InteractiveWallModule) },
  { path: 'mobile', loadChildren: () => import('./pages/mobile/mobile.module').then(m => m.MobileModule) },
  { path: 'mobile/mainpage', loadChildren: () => import('./pages/mobile/mainpage/mainpage.module').then(m => m.MainpageModule) },
  { path: 'smart-tv', loadChildren: () => import('./pages/smart-tv/smart-tv.module').then(m => m.SmartTvModule) },
  { path: 'homescreen-tv', loadChildren: () => import('./pages/homescreen-tv/homescreen-tv.module').then(m => m.HomescreenTvModule) },
  { path: '**', redirectTo: 'mobile', pathMatch: 'full' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
//{ path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },