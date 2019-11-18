import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MobileComponent } from './mobile.component';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';

const routes: Routes = [
  {
    path: '',
    component: MobileComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'mainpage',
        component: MainpageComponent
        // loadChildren: () => import('./mainpage/mainpage.module').then(m => m.MainpageModule)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class MobileRoutingModule { }
