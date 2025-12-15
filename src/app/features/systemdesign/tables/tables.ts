import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Checkbox } from '../checkbox/checkbox';


export interface TableColumn {
  key: string;
  label: string;
  class?: string;
  clickable?: boolean;
  transform?: (row: any) => string ;
  classFn?: (row: any) => string ;
  onClick?: (row: any) => void;
}



@Component({
  selector: 'app-tables',
  imports: [CommonModule, HttpClientModule, MatTableModule, MatPaginatorModule, Checkbox],
  standalone: true,
  templateUrl: './tables.html',
  styleUrl: './tables.scss'
})
export class Tables {

  //  @Input() apiUrl!: string;               
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize: number = 6;

  @Output() rowClick = new EventEmitter<any>();

  dataSource = new MatTableDataSource<any>();
  totalRows = 0;
  displayedColumnKeys: string[] = [];

  currentPage = 1;
  totalPagesArray: (number | string)[] = [];
  pagedData: any[] = [];

  selection: any[] = [];


  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.dataSource.data = this.data;
    this.updatePagination();
    this.displayedColumnKeys = ['select', ...this.columns.map(c => c.key)];
    // this.loadData(0, this.pageSize);
  }

  //*********************** pagination ***************************** 
  ngOnChanges() {
    // if (this.data) {
      this.dataSource.data = this.data;
      this.updatePagination();
    // }
  }

  get totalPages() {
    const total = Math.ceil(this.data.length / this.pageSize);
    return isNaN(total) || total < 1 ? 1 : total;

  }

  updatePagination() {
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    // this.totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

    const total = totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {

      pages.push(1);
      pages.push(2);


      if (current > 4) pages.push('...');
      const start = Math.max(3, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 3) pages.push('...');

      if (!pages.includes(total)) pages.push(total);
    }

    this.totalPagesArray = pages;
    this.updatePagedData();
  }

  updatePagedData() {

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.data.slice(startIndex, endIndex);

  }

  onPageChange(page: any) {

    if (page === '...') return; // ignore ellipsis clicks
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page as number;
    this.updatePagination();
    this.updatePagedData();
  }

  onCellClick(col: TableColumn, row: any) {
    if (col.clickable && col.onClick) col.onClick(row);
    this.rowClick.emit(row);
  }
  // **************** checkbox  ****************************

  toggleRow(row: any) {
    const exists = this.selection.includes(row);
    if (exists) {
      this.selection = this.selection.filter(r => r !== row);
    } else {
      this.selection.push(row);
    }
  }

  toggleAllRows(checked: boolean) {
    if (checked) {
      this.selection = [...this.pagedData];
    } else {
      this.selection = [];
    }
  }

  isAllSelected(): boolean {
    return this.selection.length === this.pagedData.length && this.selection.length > 0;
  }

  isSomeSelected(): boolean {
    return this.selection.length > 0 && !this.isAllSelected();
  }

  //--------------status (pending/completed)---------------------------

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'verified':
        return { text: 'Completed', class: 'Completed' };
      case 'pending':
        return { text: 'Pending', class: 'Pending' };
      case 'document issue':
        return { text: 'Document Issue', class: 'Document-Issue' };
      default:
        return { text: '-', class: '' };
    }
  }

  
  
}
