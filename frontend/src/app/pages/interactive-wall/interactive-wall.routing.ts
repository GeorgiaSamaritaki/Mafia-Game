import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InteractiveWallComponent } from './interactive-wall.component';

const routes: Routes = [
    { path: '', component: InteractiveWallComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class InteractiveWallRoutingModule { }
