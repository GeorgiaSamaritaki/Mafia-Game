import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { VotingComponent } from './voting/voting.component';
import { MainpageComponent } from './mainpage.component';

const routes: Routes = [
    {
        path: '',
        component: MainpageComponent,
        // // loadChildren: () => import('./pages/smart-tv/smart-tv.module').then(m => m.SmartTvModule)
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'info', component: InfoComponent },
            { path: 'voting', component: VotingComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' },
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class MainpageRoutingModule { }
