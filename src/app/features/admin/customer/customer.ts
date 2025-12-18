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
import { Main } from '../../../core/service/main';
import { Messagebox } from '../../systemdesign/messagebox/messagebox';
import { Msgboxservice } from '../../../core/service/msgboxservice';

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


  customerGrowth = '12% from last month';
  kycCompleted: any;
  kycGrowth = '8% from last month';

  searchQuery = '';
  selectedKycStatus = 'All KYC Status';
  selectedType = 'All Types';

  selection: Customerstable[] = [];
  selectedUser: any;
  //mat table
  displayedColumns: string[] = ['select', 'CIFID', 'customerName', 'mobile', 'email', 'status', 'loanStatus', 'registrationDate'];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pageSize = 6;
  currentPage = 1;
  totalItems: any;
  totalPagesArray: (number | string)[] = [];
  fullData: any[] = [];
  AlluserData: any;
  userData: any;
  userKYCData: any;

  // View control
  showTable = true;
  selectedCustomer: Customerstable | null = null;

  //dropdown data
  // @Input() avatarUrl='https://i.pravatar.cc/40?img=12';
  // @Input() hasAvatar = false;

  selectedstatus: string = '';
  selectedOptiontype: string = '';


  Kycstatus: DropdownOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Document Issue', value: 'Document Issue' }
  ];

  allApplicants: any[] = [];
  selecteduser: any;

  filteredData: any[] = [];

  searchText: string = "";


  constructor(public http: HttpClient, public router: Router, private service: Main,private msgBox: Msgboxservice) { }
  // 
  ngOnInit(): void {
    this.loadallusers();
    this.updateVisiblePages();

      

    // this.service.getAllApplicants().subscribe({
    //   next: (response) => {

    //     this.allApplicants = response.applications;
    //   },
    //   error: (error) => {
    //     console.error('Error fetching users:', error);
    //   }
    // });

  }
  //-----------get table data from api----------------------------

  loadallusers() {

    this.service.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users:', response.data);
      
        this.AlluserData = response.data
        this.fullData = (response.data as any[]).map((item, index) => ({
          id_data: index + 1,
          CIFID: item.cif ?? "-",
          CustomerName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ?? "-",
          mobile: item.phoneNumber ?? "-",
          email: item.email ?? '',
          status: item.kycStatus ?? "-",
          loanStatus: item.kycStatus ?? "-",
          registrationDate: item.createdDateTime ?? "-",
          userId: item.userId ?? "-",
          Id: item.id ?? "-"
        }));

        this.filteredData = this.fullData;
        this.totalItems = this.fullData.length;
        const kycCompletedcount = (response.data as any[]).filter(item => item.kycStatus === 'VERIFIED').length;
        this.kycCompleted = Math.round((kycCompletedcount / this.totalItems) * 100);
        this.dataSource.sort = this.sort;
        this.updatePagedData();
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'verified':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'document issue':
        return 'Document-Issue';
      default:
        return '';
    }
  }


  getkyc(id: any) {
    console.log("id-----", id);
    this.service.selectedUserId = id;
    this.service.getKycDeatils(id).subscribe({
      next: (response) => {
        console.log('getKycDeatils:', response);
        this.userKYCData = response;
        sessionStorage.setItem("kycs", JSON.stringify(this.userKYCData.kycs))
        //  console.log('kyc response 2',this.userKYCData.kycs);
        this.router.navigate(['/admin/customerdetails']);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });

    this.selecteduser = this.allApplicants.find(
      item => item.userId === this.service.selectedUserId
    );
    if (this.selecteduser) {
      this.service.docofselectedUser = this.selecteduser
      localStorage.setItem('selecteduserDetails', JSON.stringify(this.selecteduser));
      console.log('Found user:', this.selecteduser);
    } else {
      console.warn('User not found!');
    }

  }

  //-----------------pagination------------------------------------
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    setTimeout(() => {
      this.updateVisiblePages();
    }, 100);

  }
  get totalPages() {
    const total = Math.ceil(this.totalItems / this.pageSize);
    return isNaN(total) || total < 1 ? 1 : total;

  }


  onPageChange(page: any) {

    if (page === '...') return; // ignore ellipsis clicks
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page as number;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  updatePagedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.filteredData.slice(startIndex, endIndex);
  }

  updateVisiblePages() {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Always show first two pages
      pages.push(1);
      pages.push(2);

      // Show left ellipsis
      if (current > 4) pages.push('...');

      // Middle range (around current)
      const start = Math.max(3, current - 1);
      const end = Math.min(total - 2, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      // Show right ellipsis
      if (current < total - 3) pages.push('...');

      // Always show last page
      if (!pages.includes(total)) pages.push(total);
    }

    this.totalPagesArray = pages;
  }

  //---------------------search data --------------------------

  onSearchChange(value: string) {
    this.searchText = value.toLowerCase();


    this.filteredData = this.fullData.filter(item =>
      item.CIFID?.toString().toLowerCase().includes(this.searchText) ||
      item.CustomerName?.toLowerCase().includes(this.searchText) ||
      item.mobile?.toString().toLowerCase().includes(this.searchText) ||
      item.email?.toLowerCase().includes(this.searchText) ||
      item.status?.toLowerCase().includes(this.searchText)
    );


    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  //------------------------kyc status-------------------------

  getkycstatus(value: string) {
    console.log('Selected:2', value);
    const filterValue = value.toLowerCase();

    const statusMap: any = {
      "completed": "verified",
      "pending": "pending",
      "document issue": "document issue"
    };

    const apiStatus = statusMap[filterValue];


    if (value === "All") {
      this.filteredData = this.fullData;
    } else if (value === "Completed") {

      this.filteredData = this.fullData.filter(
        item => item.status.toLowerCase() === apiStatus
      );
    }
    else if (value === "Pending") {

      let pendingdata = this.fullData.filter(
        item => item.status.toLowerCase() === apiStatus
      );

      this.filteredData = pendingdata;
    }
    else if (value === "Document Issue") {

      this.filteredData = this.fullData.filter(
        item => item.status.toLowerCase() === apiStatus
      );
    } else {
      this.filteredData = this.fullData;
    }

    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updateVisiblePages();
    this.updatePagedData();

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
