import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Checkbox } from '../../systemdesign/checkbox/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

export interface Customerstable {
  id: string;
  cifId: string;
  customerName: string;
  mobile: string;
  email: string;
  status: 'Completed' | 'Pending' | 'Document Issue';
  loanStatus: 'Completed' | 'Pending' | 'Document Issue';
  registrationDate: string;
}

// customers: Customers_[] = [
const ELEMENT_DATA: Customerstable[] = [
  {
    id: '1',
    cifId: 'CIF123456',
    customerName: 'Rajesh Kumar',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Completed',
    loanStatus: 'Completed',
    registrationDate: '2024-12-28'
  },
  {
    id: '2',
    cifId: 'CIF123456',
    customerName: 'Anita Patel',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Completed',
    loanStatus: 'Completed',
    registrationDate: '2024-12-28'
  },
  {
    id: '3',
    cifId: 'CIF123456',
    customerName: 'Suresh Gupta',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Pending',
    loanStatus: 'Pending',
    registrationDate: '2024-12-28'
  },
  {
    id: '4',
    cifId: 'CIF123456',
    customerName: 'Amit Sharma',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Document Issue',
    loanStatus: 'Document Issue',
    registrationDate: '2024-12-28'
  },
  {
    id: '5',
    cifId: 'CIF123456',
    customerName: 'Rajesh Kumar',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Pending',
    loanStatus: 'Pending',
    registrationDate: '2024-12-28'
  },
  {
    id: '6',
    cifId: 'CIF123456',
    customerName: 'Rajesh Kumar',
    mobile: '+91 8285868***',
    email: 'rajesh.k***@gmail.com',
    status: 'Pending',
    loanStatus: 'Pending',
    registrationDate: '2024-12-28'
  }
];


@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule, MatTableModule, MatCheckboxModule,MatTabsModule ,MatIconModule , Inputfield, Dropdown, Buttons, Checkbox],
  standalone: true,
  templateUrl: './customer.html',
  styleUrl: './customer.scss'
})
export class Customer {
  totalCustomers = 12456;
  customerGrowth = '12% from last month';
  kycCompleted = 98.5;
  kycGrowth = '8% from last month';

  searchQuery = '';
  selectedKycStatus = 'All KYC Status';
  selectedType = 'All Types';
  currentPage = 1;
  selection: Customerstable[] = [];
  //mat table
  displayedColumns: string[] = ['select', 'CIFID', 'CustomerName', 'Mobile', 'Email', 'Status', 'LoanStatus', 'RegistrationDate'];
  dataSource = ELEMENT_DATA;

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

  onPageChange(page: number) {
    this.currentPage = page;
    console.log('Page changed to:', page);
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
    this.selection = [...this.dataSource];
  } else {
    this.selection = [];
  }
}


  /** Check if all rows selected */
  isAllSelected() {
    return this.selection.length === this.dataSource.length && this.selection.length > 0;
  }

  /** Check if some rows selected */
  isSomeSelected() {
    return this.selection.length > 0 && this.selection.length < this.dataSource.length;
  }
}
