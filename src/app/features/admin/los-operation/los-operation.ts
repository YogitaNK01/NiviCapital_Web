import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
      key: 'CIFID',
      label: 'CIF ID',
      class: 'cifstyle',
      clickable: true,
      onClick: (row: { Id: any; }) => this.getkyc(row.Id)
    },
    { key: 'CustomerName', label: 'Customer Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Eamil' },
    { key: 'status', 
      label: 'Status', 
      class:'status', 
      classFn: (row: any) => this.getStatusClass(row.status).class,
     transform: (row: any) => this.getStatusClass(row.status).text },

    { key: 'loanStatus',
       label: 'Loan Status',
       class:'status',
       classFn: (row: any) => this.getStatusClass(row.loanStatus).class,
       transform: (row: any) => this.getStatusClass(row.loanStatus).text  },
    { key: 'registrationDate', label: 'Registration Date' },

  ];

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


  constructor(public http: HttpClient, public router: Router, private service: Main) { }
  // 
  ngOnInit(): void {
    this.loadallusers();
   

  }

  getlosdetails() {
    this.router.navigate(['/admin/losdetails']);
  }
  //-----------get table data from api----------------------------

  loadallusers() {
    this.service.getAllUsers().subscribe(res => {
      this.tableData =   (res.data as any[]).map((item, index) => ({
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

  this.filteredData = this.tableData;
    });
    
  }

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


  getkyc(id: any) {
    console.log("id-----", id);
    this.service.selectedUserId = id;
    this.service.getKycDeatils(id).subscribe({
      next: (response) => {
        // console.log('getKycDeatils:', response);
        //  this.userKYCData =response;
        //  sessionStorage.setItem("kycs",JSON.stringify(this.userKYCData.kycs))
         this.router.navigate(['/admin/losdetails']);
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
      localStorage.setItem('los--selecteduserDetails', JSON.stringify(this.selecteduser));
      console.log('Found user:', this.selecteduser);
    } else {
      console.warn('User not found!');
    }

  }

  //dropdown filter
  getkycstatuslos(value: string) {
    console.log('Selected:2', value);
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
  }

  //search from table
  onSearchChange(value: string) {
  this.searchText = value.toLowerCase();
  this.filteredData = this.tableData.filter(item =>
    item.CIFID?.toString().toLowerCase().includes(this.searchText) ||
    item.CustomerName?.toLowerCase().includes(this.searchText) ||
    item.mobile?.toString().toLowerCase().includes(this.searchText) ||
    item.email?.toLowerCase().includes(this.searchText) ||
    item.status?.toLowerCase().includes(this.searchText)
  );
}
}
