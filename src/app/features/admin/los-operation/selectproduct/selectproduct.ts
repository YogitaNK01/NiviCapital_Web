import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormsModule } from '@angular/forms';
import { Checkbox } from "../../../systemdesign/checkbox/checkbox";
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Router } from '@angular/router';
import { Successbox } from '../../customer/successbox/successbox';

@Component({
  selector: 'app-selectproduct',
  imports: [CommonModule, Dropdown, Buttons, FormsModule, Radiobuttons, Successbox],
  standalone: true,
  templateUrl: './selectproduct.html',
  styleUrl: './selectproduct.scss'
})
export class Selectproduct {
  //dropdown--------------------
  @Input() avatarUrl = '';
  @Input() hasAvatar = false;

  product: string = 'Select Product';
  selectedproduct: string = '';
  product_: string = '';
  selectProduct: DropdownOption[] = [
    { label: 'Loan', value: 'Loan', icon: '' },
  ];


  loantype: string = 'Select Loan Type';
  selectedloantype: string = '';
  loantype_: string = '';
  seleactloantype: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]

  selectedsegment: string = '';
  segment: string = 'Select Segment';
  segment_: string = '';
  selectSegment: DropdownOption[] = [
    { label: 'Retail', value: 'retail', icon: '' },
    { label: 'Corporate', value: 'corporate', icon: '' },
    { label: 'MSME', value: 'msme', icon: '' },
  ];

  seleactedcategory: string = '';
  catagory: string = 'Select Category';
  catagory_: string = '';
  seleactCategory: DropdownOption[] = [
    { label: 'Education Loan', value: 'educationloan', icon: '' },
  ]
  formData: any = {};

  //checkbox-------------------
  isChecked_rb: boolean = false;
  checkselectedOption_rb = '';

  //successbox-------------------

  arnid = "ARN2026021100005"
  issuccess:boolean=false;

  constructor(private router: Router) { }

  onSelectionChange(selectedkey: string, value: string) {
    this.formData[selectedkey] = value;
    console.log('Changed:', selectedkey, value);
  }

  onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
  }

  goToloanscreen() {
    this.router.navigate(['admin/los-operation/newloan']);
  }

  tosuccess() {
    this.issuccess=true;
    // this.router.navigate(['admin/customer/successbox']);
 


  }

   handleSuccessAction(action: string) {
    if (action === 'letsstart') {

      
    }}
}
