import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';



@Component({
  selector: 'app-estimateexpense',
  imports: [Buttons,CommonModule,RouterModule,ReactiveFormsModule,Inputfield,Dropdown],
  templateUrl: './estimateexpense.html',
  styleUrl: './estimateexpense.scss'
})
export class Estimateexpense {

   openIndex: number[] = [0];
  accordions = [
    { title: 'Education Fees - ₹90,40,437  ', alwaysOpen: true },
    { title: 'Living Expense - ₹90,40,437 ', alwaysOpen: false },
    { title: 'Miscellaneous - ₹0', alwaysOpen: false },
  ];
  expenseForm!: FormGroup
  
selectedCategories: string[] = [];

   @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  placeholderval= "Select from dropdown"
  labelval= "Select Categories"
  selectedOption: string = '';
  searchOptions: DropdownOption[] = [
    { label: 'Rent', value: 'Rent', icon: '' },
    { label: 'Security Deposit', value: 'SecurityDeposit', icon: '' },
    { label: 'Groceries', value: 'Groceries', icon: '' },
    { label: 'Utilities', value: 'Utilities', icon: '' },
    { label: 'Transport', value: 'Transport', icon: '' },
    { label: 'Accommodation', value: 'Accommodation', icon: '' },
    { label: 'Health Insurance', value: 'HealthInsurance', icon: '' },
     { label: 'Personal Expense', value: 'PersonalExpense', icon: '' },
    { label: 'Other Expense', value: 'OtherExpense', icon: '' },
  ];

  expenseLabels: any = {
  Rent: 'Rent',
  SecurityDeposit: 'Security Deposit',
  Groceries: 'Groceries',
  Utilities: 'Utilities',
  Transport: 'Transport',
  Accommodation: 'Accommodation',
  HealthInsurance: 'Health Insurance',
  PersonalExpense: 'Personal Expense',
  OtherExpense: 'Other Expense'
};

frequencylabelval= "Select Frequency"
  searchfrequencyOptions: DropdownOption[] = [
    { label: 'Weekly', value: 'Weekly', icon: '' },
    { label: 'Monthly', value: 'Monthly', icon: '' },
    { label: 'Yearly', value: 'Yearly', icon: '' },
  ]

  searchby: string = 'Select by';
  searchedvalue: any;
  
  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice, private route: ActivatedRoute) { }

   ngOnInit(): void {
    this.expenseForm = this.fb.group({


      securityfrequency: ['', Validators.required],
      adhaarfront: ['', Validators.required],
    })
   }

  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    this.cd.detectChanges();
  }

  submit() {

  }

  onfrequencyChange(values: any,key:any) {
     this.selectedCategories = values;
  console.log("Selected:", values);
  }

 
  oncatagoryChange(values: string | string[]):void {
  this.selectedCategories = Array.isArray(values) ? values : [values];
  console.log("Selected:", this.selectedCategories);
   if (this.selectedCategories.length === this.searchOptions.length) {
      this.openIndex = this.accordions.map((_, i) => i);
    }

}

 isChecked(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  onValueChange(value: string) {
    console.log('Selected:2', value);
  }

  addmore(data:any){}
   back(){
    this.stepperService.previous();
  }
  
   next() {
  this.stepperService.next();
}
}
