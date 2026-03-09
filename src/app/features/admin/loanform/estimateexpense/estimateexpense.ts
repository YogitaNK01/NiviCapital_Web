import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';

interface OptionItem {
  label: string;
  value: string;
  code?: string;
}

@Component({
  selector: 'app-estimateexpense',
  imports: [Buttons, CommonModule, RouterModule, ReactiveFormsModule, Inputfield, Dropdown],
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
  selectedmisCategories: string[] = [];


  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  placeholderval = "Select from dropdown"
  placeholderfrequcyval = ""
  labelval = "Select Categories"
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


  livCatagories: OptionItem[] = [];
  misCatagories: OptionItem[] = [];


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

  frequencylabelval = "Select Frequency"
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

      tutionfees: ['', Validators.required],
      tutionfeesAUD: ['', Validators.required],
      securityfrequency: ['', Validators.required],
      livingexpenses: this.fb.array([]),
      miscexpenses: this.fb.array([])
    })

    this.livingexp();
    this.miscgexp();

    this.expenseForm.get('tutionfees')?.valueChanges.subscribe(() => {
      this.calculateINRtoAUD();
    });

    this.expenseForm.get('tutionfeesAUD')?.valueChanges.subscribe(() => {
      this.calculateINRtoAUD();
    });
  }

  get livingexpenses(): FormArray {
  return this.expenseForm.get('livingexpenses') as FormArray;
}

createExpense(category: string): FormGroup {
  return this.fb.group({
    category: [category],
    securityfrequency: ['', Validators.required],
    amountINR: ['', Validators.required],
    amountAUD: ['', Validators.required],
    description: ['']
  });
}

addCategoryExpense(category: string) {
  this.livingexpenses.push(this.createExpense(category));
}

addmore(category: string) {
  this.livingexpenses.push(this.createExpense(category));
}


  get miscexpenses(): FormArray {
  return this.expenseForm.get('miscexpenses') as FormArray;
}

createmiscExpense(category: string): FormGroup {
  return this.fb.group({
    category: [category],
    securityfrequency: ['', Validators.required],
    amountINR: ['', Validators.required],
    amountAUD: ['', Validators.required],
    description: ['']
  });
}

addmiscCategoryExpense(category: string) {
  this.livingexpenses.push(this.createmiscExpense(category));
}

miscaddmore(category: string) {
  this.livingexpenses.push(this.createmiscExpense(category));
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

  calculateINRtoAUD() {
    const tutionfeesINR = this.expenseForm.get('tutionfees')?.value;
    
    if (!tutionfeesINR) return;

    const tutionfeesAUDValue = tutionfeesINR / 62.5;
  
    this.expenseForm.patchValue(
    { tutionfeesAUD: tutionfeesAUDValue },
    { emitEvent: false }
  );

  }
  livingexp() {
    this.loanformservice.getlivingexp().subscribe((res: any) => {
      const list = res.data ?? res;

      this.livCatagories = list.map((s: any) => ({
        value: s.id,
        label: s.name,
        code: s.code
      }));

    });
  }

  oncatagoryChange(values: string | string[]): void {
    this.selectedCategories = Array.isArray(values) ? values : [values];
    console.log("Selected:", this.selectedCategories);
    if (this.selectedCategories.length === this.searchOptions.length) {
      this.openIndex = this.accordions.map((_, i) => i);
    }

  }
  getCategoryLabel(value: any): string {
    const found = this.livCatagories.find(c => c.value == value);
    return found?.label || '';
  }

  onfrequencyChange(values: any, key: any) {
    this.selectedCategories = values;
    console.log("Selected:", values);
  }

  miscgexp() {
    this.loanformservice.getmiscellaneousexp().subscribe((res: any) => {
      const list = res.data ?? res;

      this.misCatagories = list.map((s: any) => ({
        value: s.id,
        label: s.name,
        code: s.code
      }));

    });
  }

  onmiscatagoryChange(values: string | string[]): void {
    this.selectedmisCategories = Array.isArray(values) ? values : [values];
    console.log("Selected:", this.selectedmisCategories);
    if (this.selectedmisCategories.length === this.searchOptions.length) {
      this.openIndex = this.accordions.map((_, i) => i);
    }

  }
  getmisCategoryLabel(value: any): string {
    const found = this.misCatagories.find(c => c.value == value);
    return found?.label || '';
  }

  onfrequencyChange1(values: any, key: any) {
    this.selectedCategories = values;
    console.log("Selected:", values);
  }

  isChecked(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  onValueChange(value: string) {
    console.log('Selected:2', value);
  }

 
  back() {
    this.stepperService.previous();
  }

  next() {
    this.stepperService.next();
  }
}
