import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AugmentedTableComponent } from './augmented-table.component';
import { DayComponent } from './day/day.component';

const routes: Routes = [
    {
        path: '',
        component: AugmentedTableComponent,
        children: [
            {
                path: 'day',
                component: DayComponent
            },
            { path: '', redirectTo: 'day', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})

export class AugmentedTableRoutingModule { }
