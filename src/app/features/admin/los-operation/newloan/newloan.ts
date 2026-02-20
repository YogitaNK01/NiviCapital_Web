import { Component, Input } from '@angular/core';
import { Dropdown, DropdownOption } from "../../../systemdesign/dropdown/dropdown";
import { CommonModule } from '@angular/common';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Main } from '../../../../core/service/main';
import { FormsModule } from '@angular/forms';
import { Tables } from "../../../systemdesign/tables/tables";
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { Router } from '@angular/router';

@Component({
  selector: 'app-newloan',
  standalone:true,
  imports: [CommonModule, Dropdown, Inputfield, FormsModule, Tables, Buttons],
  templateUrl: './newloan.html',
  styleUrl: './newloan.scss'
})
export class Newloan {
 @Input() avatarUrl='';
  @Input() hasAvatar = false;
   selectedOption: string = '';
  searchOptions: DropdownOption[] = [
      { label: 'Mobile Number', value: 'Mobile', icon: '' },
      { label: 'NCID', value: 'NCID', icon: '' },
      { label: 'CUSTID', value: 'CUSTID', icon: '' },
      { label: 'PAN Number', value: 'PAN', icon: '' },
      { label: 'Aadhaar Number', value: 'Aadhaar', icon: '' },
      { label: 'Email', value: 'Email', icon: '' },
      { label: 'Passport', value: 'Passport', icon: '' },
    ];
  
    searchby: string = 'Search by';
    searchedvalue :any;


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
    { key: 'firstName', label: 'First Name' },
     { key: 'lastName', label: 'Last Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      class: 'status',
      // classFn: (row: any) => this.getStatusClass(row.status).class,
      // transform: (row: any) => this.getStatusClass(row.status).text
    },

    {
      key: 'kycStatus',
      label: 'KYC Status',
      class: 'status',
      // classFn: (row: any) => this.getStatusClass(row.kycStatus).class,
      // transform: (row: any) => this.getStatusClass(row.kycStatus).text
    },
    // { key: 'registrationDate', label: 'Registration Date' },

  ];
  filteredData: any[] = [];

constructor(public service:Main,private router:Router){}


    onSelectionChange(value: string) {
    console.log('Selected:1', value);
  }

  onValueChange(value: string) {
    console.log('Selected:2', value);
  }

  toProductscreen() {
    this.router.navigate(["/admin/losoperation/selectproduct"]);
  }
}
