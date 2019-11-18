import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AugmentedTableRoutingModule } from './augmented-table.routing';
import { AugmentedTableComponent } from './augmented-table.component';


@NgModule({
  declarations: [
    AugmentedTableComponent,
  ],
  imports: [
    CommonModule,
    AugmentedTableRoutingModule
  ]
})

export class AugmentedTableModule { }
