import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AugmentedTableComponent } from './augmented-table.component';

const routes: Routes = [
    { path: '', component: AugmentedTableComponent, },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class AugmentedTableRoutingModule { }
