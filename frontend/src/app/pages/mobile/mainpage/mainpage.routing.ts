import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage.component';
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
    {
        path: '',
        component: MainpageComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'info', component: InfoComponent },
            { path: 'voting', component: VotingComponent },
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
