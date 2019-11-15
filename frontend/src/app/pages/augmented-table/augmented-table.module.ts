import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AugmentedTableRoutingModule } from './augmented-table.routing';
import { AugmentedTableComponent } from './augmented-table.component';
import { DayComponent } from './day/day.component';


@NgModule({
  declarations: [
    AugmentedTableComponent,
    DayComponent
  ],
  imports: [
    CommonModule,
    AugmentedTableRoutingModule
  ]
})

export class AugmentedTableModule { }
