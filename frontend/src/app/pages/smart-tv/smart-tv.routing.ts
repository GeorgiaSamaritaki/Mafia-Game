import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartTvComponent } from './smart-tv.component';

const routes: Routes = [
    { path: '', component: SmartTvComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class SmartTvRoutingModule { }
