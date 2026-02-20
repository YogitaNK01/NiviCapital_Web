import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selectproduct',
  imports: [CommonModule, Dropdown, Buttons, FormsModule],
  standalone: true,
  templateUrl: './selectproduct.html',
  styleUrl: './selectproduct.scss'
})
export class Selectproduct {

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;

  product: string = 'Select Product';
  selectedproduct: string = '';
  selectProduct: DropdownOption[] = [
    { label: 'Loan', value: 'Loan', icon: '' },
  ];


  loantype: string = 'Select Loan Type';
  selectedloantype: string = '';
  seleactloantype: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]

  selectedsegment: string = '';
  segment: string = 'Select Segment';
  selectSegment: DropdownOption[] = [
    { label: 'Retail', value: 'retail', icon: '' },
    { label: 'Corporate', value: 'corporate', icon: '' },
    { label: 'MSME', value: 'msme', icon: '' },
  ];

  seleactedcategory: string = '';
  catagory: string = 'Select Category';
  seleactCategory: DropdownOption[] = [
    { label: 'Education Loan', value: 'educationloan', icon: '' },
  ]
formData: any = {};


  searchby: string = 'Search by';
  searchedvalue: any;


  onSelectionChange(selectedkey: string , value:string) {
    this.formData[selectedkey] = value;
  console.log('Changed:', selectedkey, value);
  }

 
}
