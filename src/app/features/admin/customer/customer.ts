import { Component, Input, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Checkbox } from '../../systemdesign/checkbox/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Main } from '../../../core/service/main';
import { Messagebox } from '../../systemdesign/messagebox/messagebox';
import { Msgboxservice } from '../../../core/service/msgboxservice';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Tables } from '../../systemdesign/tables/tables';
import { TableData } from '../../../core/service/table-data';

// Types & Interfaces for type safety
interface UserData {
  id: string;
  custId:string;
  ncId:string
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: string;
  kycStatus: string;
  createdAt: number[];
  
}

interface TransformedUserData {
  // id: string;
  custId:string;
  ncId:string
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: string;
  kycStatus: string;
  createdAt: number[];
  // Id: string;
}

// Configuration Constants
const CONFIG = {
  PAGE_SIZE: 6,
  MAX_VISIBLE_PAGES: 5,
  DEBOUNCE_TIME: 300
};

const STATUS_MAP: { [key: string]: string } = {
  'completed': 'verified',
  'pending': 'pending',
  'document issue': 'document issue'
};

const SEARCH_FIELDS = ['CIFID', 'CustomerName', 'mobile', 'email'];

@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule, MatTableModule, MatCheckboxModule, MatTabsModule, MatPaginatorModule,
    MatSortModule, MatIconModule, RouterModule, HttpClientModule, Inputfield, Dropdown, Buttons,Tables],
  standalone: true,
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Customer implements OnInit, OnDestroy {

    columns = [
    {
      key: 'custId',
      label: 'CUSTID',
      class: 'cifstyle',
      clickable: true,
      onClick: (row: { Id: any; }) => this.getpidata(row.Id),
      routerLink: '/admin/customerdetails',
      queryParams: "{ mode: 'view', id: row.id }"
    },
    { key: 'ncId', label: 'NCID' },
    { key: 'firstName', label: 'First Name' },
     { key: 'lastName', label: 'Last Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      class: 'status',
      classFn: (row: any) => this.getStatusClass(row.status).class,
      transform: (row: any) => this.getStatusClass(row.status).text
    },

    {
      key: 'kycStatus',
      label: 'KYC Status',
      class: 'status',
      classFn: (row: any) => this.getStatusClass(row.kycStatus).class,
      transform: (row: any) => this.getStatusClass(row.kycStatus).text
    },
    // { key: 'registrationDate', label: 'Registration Date' },

  ];

showtable:boolean = true;
nodata:boolean = false;
  private destroy$ = new Subject<void>();

  customerGrowth = '12% from last month';
  kycCompleted: number | null = null;
  kycGrowth = '8% from last month';

  searchQuery = '';
  selectedKycStatus = 'All KYC Status';
  selectedType = 'All Types';

  selection: any[] = [];
  selectedUser: any;
  displayedColumns: string[] = ['select', 'CIFID', 'customerName', 'mobile', 'email', 'status', 'loanStatus', 'registrationDate'];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pageSize = CONFIG.PAGE_SIZE;
  currentPage = 1;
  totalItems: number = 0;
  totalPagesArray: (number | string)[] = [];
  fullData: TransformedUserData[] = [];
  AlluserData: any[] = [];
  userData: any;
  userKYCData: any;
  tableData: any[] = [];
  showTable = true;
  selectedCustomer: any = null;

  selectedstatus: string = '';
  selectedOptiontype: string = '';
  searchText: string = '';

  Kycstatus: DropdownOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Document Issue', value: 'Document Issue' }
  ];

  allApplicants: any[] = [];
  selecteduser: any;
  filteredData: TransformedUserData[] = [];

  kyctype: DropdownOption[] = [
    { label: 'Type 1', value: 'Type 1' },
    { label: 'Type 2', value: 'Type 2' },
    { label: 'Type 3', value: 'Type 3' },
  ];

  constructor(private http: HttpClient, private router: Router, private service: Main, private msgBox: Msgboxservice,private cdr: ChangeDetectorRef, private tableDataService: TableData) { }
  ngOnInit(): void {
    this.loadallusers();
    this.updateVisiblePages();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.updateVisiblePages();
    }, 100);
  }

  private loadallusers(): void {
    this.service.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let resdate= response.data.content;
          if(resdate.length == 0){
            this.nodata = true;
          } else {
          this.AlluserData = resdate;
          this.fullData = this.tableDataService.transformUserData(resdate);
          this.filteredData = this.fullData;
          this.totalItems = this.fullData.length;
          this.kycCompleted = this.tableDataService.calculateKycMetrics(resdate, this.totalItems);
          this.dataSource.sort = this.sort;
          this.updatePagedData();

          this.tableData = this.fullData; // Initialize tableData for filters
          this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }
  

  getStatusClass(status: string) {
    return this.tableDataService.getStatus_Class(status);
  }

  private hasData(data: any): boolean {
    return this.tableDataService.hasData(data);
  }


  getpidata(id: string): void {
    this.service.selectedUserId = id;
    this.service.getKycDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.userKYCData = response;
          this.service.set_pi_KycData(this.userKYCData.data);
          this.router.navigate(['/admin/customerdetails']);
        },
        error: (error) => {
          console.error('Error fetching KYC details:', error);
        }
      });

    this.selecteduser = this.allApplicants.find(
      item => item.userId === this.service.selectedUserId
    );
    if (this.selecteduser) {
      this.service.docofselectedUser = this.selecteduser;
      localStorage.setItem('selecteduserDetails', JSON.stringify(this.selecteduser));
    }
  }

  formatDateOnly(dateArr: number[] | null | undefined): string {
    return this.tableDataService.formatDateOnly(dateArr);
  }
//pagination methods
  get totalPages(): number {
    const total = Math.ceil(this.totalItems / this.pageSize);
    return isNaN(total) || total < 1 ? 1 : total;
  }

  onPageChange(page: any): void {
    if (page === '...') return;
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page as number;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  updatePagedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.filteredData.slice(startIndex, endIndex);
  }

  updateVisiblePages(): void {
    const total = this.totalPages;
    this.totalPagesArray = this.tableDataService.getVisiblePages(this.currentPage, total);
  }

  //search and filter methods
  onSearchChange(value: string): void {
    this.searchText = value.toLowerCase();
    this.filteredData = this.tableDataService.filterBySearch(
      this.fullData,
      value, SEARCH_FIELDS
    );

    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  getkycstatus(value: string): void {
    const statusMap: { [key: string]: string } = {
      'completed': 'verified',
      'pending': 'pending',
      'document issue': 'document issue'
    };

    this.filteredData = this.tableDataService.filterByStatus(this.fullData, value, statusMap);
    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  getkyc_type(value: string): void {
    // Implement type filtering logic
  }

  onSearch(): void {
    // Implement search logic
  }

  addCustomer(): void {
    // Implement add customer logic
  }

  toggleRow(row: any): void {
    const index = this.selection.indexOf(row);
    if (index === -1) {
      this.selection.push(row);
    } else {
      this.selection.splice(index, 1);
    }
  }

  toggleAllRows(checked: boolean): void {
    if (checked) {
      this.selection = [...this.dataSource.data];
    } else {
      this.selection = [];
    }
  }

  isAllSelected(): boolean {
    return this.selection.length === this.dataSource.data.length && this.selection.length > 0;
  }

  isSomeSelected(): boolean {
    return this.selection.length > 0 && this.selection.length < this.dataSource.data.length;
  }

  addcustomer(){
    console.log("add");
    
    this.router.navigate(['admin/customer/checkcontact']);
  }

  onEdit(data: any){
    console.log(data);
    
  }
  
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
