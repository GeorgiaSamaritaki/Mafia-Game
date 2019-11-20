import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomescreenTvComponent } from './homescreen-tv.component';

const routes: Routes = [
    { path: '', component: HomescreenTvComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})


export class HomescreenTvRoutingModule { }
