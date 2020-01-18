import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BotsComponent } from './bots.component';

const routes: Routes = [
    { path: '', component: BotsComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class BotsRoutingModule { }
