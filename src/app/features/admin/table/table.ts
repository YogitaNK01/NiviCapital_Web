import { Component } from '@angular/core';
import { Tables } from '../../systemdesign/tables/tables';
import { CommonModule } from '@angular/common';
import { Main } from '../../../core/service/main';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-table',
  imports: [ CommonModule,MatTableModule, MatCheckboxModule, MatTabsModule, MatPaginatorModule,
    MatSortModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  standalone: true
})
export class Table {

  



}


