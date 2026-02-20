import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { Main } from '../../../core/service/main';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Checkbox } from '../../systemdesign/checkbox/checkbox';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { TableColumn, Tables } from '../../systemdesign/tables/tables';
import { takeUntil } from 'rxjs';
import { TableData } from '../../../core/service/table-data';

const SEARCH_FIELDS = ['CIFID', 'CustomerName', 'mobile', 'email'];

@Component({
  selector: 'app-los-operation',
  imports: [CommonModule, FormsModule, MatTableModule, MatCheckboxModule, MatTabsModule, MatPaginatorModule,
    MatSortModule, MatIconModule, RouterModule, HttpClientModule, Inputfield, Dropdown, Buttons, Tables],
  templateUrl: './los-operation.html',
  styleUrl: './los-operation.scss'
})
export class LosOperation {

   columns = [
    {
      key: 'custId',
      label: 'CUSTID',
      class: 'cifstyle',
      clickable: true,
      // onClick: (row: { Id: any; }) => this.getpidata(row.Id),
      routerLink: '/admin/customerdetails',
      queryParams: "{ mode: 'view', id: row.id }"
    },
    { key: 'ncId', label: 'NCID' },
     { key: 'arn', label: 'ARN' },
     { key: 'arn1', label: 'ARN' },

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

  pageSize = 6;
  currentPage = 1;
  totalItems: number = 0;
  totalPagesArray: (number | string)[] = [];
  fullData: any[] = [];
  AlluserData: any[] = [];

  allLosData: any;
  destroy$ = new EventEmitter<void>();
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  tableData: any[] = [];
  allApplicants: any[] = [];
  selecteduser: any;

  filteredData: any[] = [];

  searchText: string = "";

  selectedOption1: string = '';
  selectedOption2: string = '';
  selectedOption3: string = '';


  Kycstatus: DropdownOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Document Issue', value: 'Document Issue' }
  ];

  kycCompleted: number | null = null;
  totalPages: any;

  cards=Array(4)

  constructor(public http: HttpClient, public router: Router, private service: Main, private cdr: ChangeDetectorRef,private tableDataService: TableData) { }
  // 
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

 private hasData(data: any): boolean {
    return this.tableDataService.hasData(data);
  }


  
  //-----------get table data from api----------------------------

private loadallusers(): void {
    this.service.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
           let resdate= response.data.content;
          this.AlluserData = resdate;
          this.fullData = this.tableDataService.transformUserData(resdate);
          this.filteredData = this.fullData;
          this.totalItems = this.fullData.length;
          this.kycCompleted = this.tableDataService.calculateKycMetrics(resdate, this.totalItems);
          this.dataSource.sort = this.sort;
          this.updatePagedData();

          this.tableData = this.fullData; // Initialize tableData for filters
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }
  

  getStatusClass(status: string) {
    return this.tableDataService.getStatus_Class(status);
  }

  formatDateOnly(dateArr: number[] | null | undefined): string {
    return this.tableDataService.formatDateOnly(dateArr);
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

  getkyc(id: any) {
    this.service.selectedUserId = id;
    this.service.getKycDetails(id).subscribe({
      next: (response) => {
        this.router.navigate(['/admin/losdetails']);
      },
      error: (error) => {
        console.error('Error fetching kyc details:', error);
      }
    });

    this.selecteduser = this.allApplicants.find(
      item => item.userId === this.service.selectedUserId
    );
    if (this.selecteduser) {
      this.service.docofselectedUser = this.selecteduser;
      localStorage.setItem('los--selecteduserDetails', JSON.stringify(this.selecteduser));
    }
  }

  //dropdown filter
  getkycstatuslos(value: string) {
    const filterValue = value.toLowerCase();

    const statusMap: any = {
      "completed": "verified",
      "pending": "pending",
      "document issue": "document issue"
    };

    const apiStatus = statusMap[filterValue];


    if (value === "All") {
      this.filteredData = this.tableData;
    } else if (value === "Completed") {

      this.filteredData = this.tableData.filter(
        item => item.status.toLowerCase() === apiStatus
      );
    }
    else if (value === "Pending") {

      let pendingdata = this.tableData.filter(
        item => item.status.toLowerCase() === apiStatus
      );

      this.filteredData = pendingdata;
    }
    else if (value === "Document Issue") {

      this.filteredData = this.tableData.filter(
        item => item.status.toLowerCase() === apiStatus
      );
    } else {
      this.filteredData = this.tableData;
    }
    this.cdr.detectChanges(); // Trigger change detection for filter
  }

  //search from table
  onSearchChange(value: string) {
     this.searchText = value.toLowerCase();
    this.filteredData = this.tableDataService.filterBySearch(
      this.fullData,
      value,SEARCH_FIELDS
      
    );

    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updateVisiblePages();
    this.updatePagedData();
  }

  //redirection to loan details page
   getloandetails(id: string): void {
    this.service.selectedUserId = id;
    this.service.getLosDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('getLosDetails:', response);
          this.allLosData = response.applications;
          this.service.set_los_Data(this.allLosData);
          this.router.navigate(['/admin/losdetails']);
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

   getkyc_type(value: string): void {
    // Implement type filtering logic
  }

  applyLoan() {
    this.router.navigate(['/admin/losoperation/newloan']);
  }
}
