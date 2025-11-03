import { Component, Input, OnInit, ViewChild } from '@angular/core';

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

export interface Customerstable {
  id: number;
  cif: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string;
  emailId: string | null;
  kycStatus: string;
  productType?: string;
  planToStart?: string;


}



@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule, MatTableModule, MatCheckboxModule, MatTabsModule, MatPaginatorModule,
    MatSortModule, MatIconModule, RouterModule, HttpClientModule, Inputfield, Dropdown, Buttons, Checkbox],
  standalone: true,
  templateUrl: './customer.html',
  styleUrl: './customer.scss'
})
export class Customer implements OnInit {

  totalCustomers = 12456;
  customerGrowth = '12% from last month';
  kycCompleted = 98.5;
  kycGrowth = '8% from last month';

  searchQuery = '';
  selectedKycStatus = 'All KYC Status';
  selectedType = 'All Types';

  selection: Customerstable[] = [];
  //mat table
  displayedColumns: string[] = ['select', 'CIFID', 'customerName', 'mobile', 'email', 'status', 'loanStatus', 'registrationDate'];
  // dataSource = ELEMENT_DATA;
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pageSize = 5;
  currentPage = 1;
  totalItems: any;
  fullData: any[] = [];
AlluserData: any[] = [];
  userData: any;

  // View control
  showTable = true;
  selectedCustomer: Customerstable | null = null;

  //dropdown data
  // @Input() avatarUrl='https://i.pravatar.cc/40?img=12';
  // @Input() hasAvatar = false;

  selectedOption1: string = '';
  selectedOption2: string = '';
  selectedOption3: string = '';


  Kycstatus: DropdownOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Document Issue', value: 'Document Issue' }
  ];


  constructor(public http: HttpClient, public router: Router) { }
  // 
  ngOnInit(): void {
    this.getuserdeatils()


  }
  //get table data from api
  getuserdeatils() {
    this.http.get<any[]>('/api/verification/users').subscribe({
      next: (response) => {

        this.AlluserData =response
          this.fullData = (response as any[]).map((item, index) => ({
          id: index + 1,
          CIFID: item.cif ?? "-",
          CustomerName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ?? "-",
          mobile: item.phoneNumber ?? "-",
          email: item.emailId ?? '',
          status: item.kycStatus ?? "-",
          loanStatus: item.kycStatus ?? "-",
          registrationDate: item.planToStart ?? "-",
          userId: item.userId ?? "-"
        }));

        this.totalItems = this.fullData.length;
        this.dataSource.sort = this.sort;
        this.updatePagedData();
      },
      error: (error) => {
        console.error(' API Error:', error);
      },
      complete: () => {
        console.log(' Request completed');
      }
    })
  }
  //pagination
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedData();
  }

  updatePagedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.fullData.slice(startIndex, endIndex);
  }

  //user details 
  goToUserDetails(data: string) {
    const fullUser = this.AlluserData.find(item => item.userId === data);

    if (fullUser) {
      localStorage.setItem('selecteduserDetails', JSON.stringify(fullUser));
      this.router.navigate(['/admin/customerdetails']);
    } else {
      console.warn('User not found in fullData for CIFID:', data);
    }


    // this.router.navigate(['/admin/customerdetails'],{ state: { user: data }});
  }

  getkycstatus(value: string) {
    console.log('Selected:2', value);
  }

  kyctype: DropdownOption[] = [
    { label: 'Type 1', value: 'Type 1' },
    { label: 'Type 2', value: 'Type 2' },
    { label: 'Type 3', value: 'Type 3' },
  ];

  getkyc_type(value: string) {
    console.log('Selected:2', value);
  }

  onSearch() {
    console.log('Searching:', this.searchQuery);
  }

  addCustomer() {
    console.log('Add customer clicked');
  }



  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Completed': 'status-completed',
      'Pending': 'status-pending',
      'Document Issue': 'status-document-issue'
    };
    return classes[status] || '';
  }

  /*****************  table checkbox *******************/

  /** Toggle a single row */
  toggleRow(row: Customerstable) {
    const index = this.selection.indexOf(row);
    if (index === -1) {
      this.selection.push(row);
    } else {
      this.selection.splice(index, 1);
    }
  }

  /** Select all rows */
  toggleAllRows(checked: boolean) {
    if (checked) {
      this.selection = [...this.dataSource.data];
    } else {
      this.selection = [];
    }
  }


  /** Check if all rows selected */
  isAllSelected() {
    return this.selection.length === this.dataSource.data.length && this.selection.length > 0;
  }

  /** Check if some rows selected */
  isSomeSelected() {
    return this.selection.length > 0 && this.selection.length < this.dataSource.data.length;
  }
}
