import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Main } from '../../../../core/service/main';

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
  allcatagory= "Select from dropdown"
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

  applicantId:any;
  applicationId:any
  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice, private route: ActivatedRoute, public main: Main) { }

  ngOnInit(): void {

     this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

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

    const cleanINR = Number(tutionfeesINR.toString().replace(/,/g, ''));

    if (!cleanINR) return;

    const tutionfeesAUDValue = cleanINR / 62.5;

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

  // =======================================================================================================
  get livingexpenses(): FormArray {
    return this.expenseForm.get('livingexpenses') as FormArray;
  }

  createExpense(category: string): FormGroup {
    const group = this.fb.group({
      category: [category],
      securityfrequency: ['Monthly', Validators.required],
      amountINR: ['', Validators.required],
      amountAUD: ['', Validators.required],
      description: ['']
    });
    group.get('amountINR')?.valueChanges.subscribe((val) => {
      if (!val) return;

      const cleanINR = Number(val.toString().replace(/,/g, ''));

      if (!cleanINR) return;

      const aud = cleanINR / 62.5;

      group.patchValue(
        { amountAUD: aud.toString() },
        { emitEvent: false }
      );


    });

    return group;

  }

  addCategoryExpense(category: string) {
    this.livingexpenses.push(this.createExpense(category));
  }

  addmore(category: string) {
    this.livingexpenses.push(this.createExpense(category));
  }
  oncatagoryChange(values: string | string[]): void {

    this.selectedCategories = Array.isArray(values) ? values : [values];

    this.handleCategoryChange(
      values,
      this.livingexpenses,
      (category) => this.addCategoryExpense(category)
    );

  }
  getCategoryLabel(value: any): string {
    const found = this.livCatagories.find(c => c.value == value);
    return found?.label || '';
  }

  onfrequencyChange(values: any, key: any) {
    this.selectedCategories = values;
    // console.log("Selected:", values);
  }


// --------------------------------------------------------------------------------

  get miscexpenses(): FormArray {
    return this.expenseForm.get('miscexpenses') as FormArray;
  }


  createmiscExpense(category: string): FormGroup {
    const group = this.fb.group({
      category: [category],
      securityfrequency: ['Monthly', Validators.required],
      amountINR: ['', Validators.required],
      amountAUD: ['', Validators.required],
      description: ['']
    });

    group.get('amountINR')?.valueChanges.subscribe((val) => {
      if (!val) return;

      const cleanINR = Number(val.toString().replace(/,/g, ''));

      if (!cleanINR) return;

      const aud = cleanINR / 62.5;

      group.patchValue(
        { amountAUD: aud.toString() },
        { emitEvent: false }
      );


    });

    return group;
  }

  addmiscCategoryExpense(category: string) {
    this.miscexpenses.push(this.createmiscExpense(category));
  }

  miscaddmore(category: string) {
    this.miscexpenses.push(this.createmiscExpense(category));
  }


  onmiscatagoryChange(values: string | string[]): void {

    this.selectedmisCategories = Array.isArray(values) ? values : [values];

    this.handleCategoryChange(
      values,
      this.miscexpenses,
      (category) => this.addmiscCategoryExpense(category)
    );

  }
  getmisCategoryLabel(value: any): string {
    const found = this.misCatagories.find(c => c.value == value);
    return found?.label || '';
  }

  onfrequencyChange1(values: any, key: any) {
    this.selectedmisCategories = values;
    // console.log("Selected:", values);
  }

  isChecked(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  onValueChange(value: string) {
    // console.log('Selected:2', value);
  }

// =====================================================================================

handleAmountInput(event: any, controlName: string) {
  this.main.restrictInput(event, 'number');
  this.formatAmount(event, controlName);
}

  //format amount 2000000 to 20,00,000
  formatAmount(event: any, controlName: string, index?: number,type?: 'living' | 'misc') {

    let value = event.target.value;

    if (!value) return;

    value = value.replace(/,/g, '');
    value = value.replace(/\D/g, '');

    const formatted = this.formatIndian(value);
    if (index !== undefined) {
       const array = type === 'misc' ? this.miscexpenses : this.livingexpenses;

      const group = array.at(index) as FormGroup;
      group.get(controlName)?.setValue(formatted, { emitEvent: false });
      // console.log("Row Updated:", group.value);
    }
    else {
      this.expenseForm.get(controlName)?.setValue(formatted, { emitEvent: false });

      // console.log("Root Updated:", this.expenseForm.get(controlName)?.value);
    }

  }

  formatIndian(x: string): string {
    if (!x) return '';
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  }

  handleCategoryChange(values: string | string[], formArray: FormArray, addFn: (category: string) => void) {

    const selected = Array.isArray(values) ? values : [values];

    const existingCategories = formArray.controls.map(
      (ctrl: any) => ctrl.get('category')?.value
    );

    selected.forEach(category => {

      if (!existingCategories.includes(category)) {
        addFn(category);
      }

    });

    for (let i = formArray.length - 1; i >= 0; i--) {
    const category = formArray.at(i).get('category')?.value;

    if (!selected.includes(category)) {
      formArray.removeAt(i);
    }
  }
  }

  back() {
    this.stepperService.previous();
  }

  next1() {
   
    this.stepperService.next();}
  next() {
   
    // this.stepperService.next();
    let formdata= this.expenseForm.value
  console.log("form data Expenses:", formdata);

  const livingExpenses = this.expenseForm.value.livingexpenses.map((item: any) => ({
  livingExpenseItemMasterId: item.category,
  frequency: item.securityfrequency?.toUpperCase(),
  amountInr: Number(item.amountINR.replace(/,/g, '')),
  description: item.description || ''
}));

const miscExpenses = this.expenseForm.value.miscexpenses.map((item: any) => ({
  miscellaneousExpenseItemMasterId: item.category,
  frequency: item.securityfrequency?.toUpperCase(),
  amountInr: Number(item.amountINR.replace(/,/g, '')),
  description: item.description || ''
}));

   
    let input ={
tuitionFeesInr: Number(formdata.tutionfees.replace(/,/g, '')),
items:[ ...livingExpenses, ...miscExpenses]
    }

     this.loanformservice.estimateExpense(input, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {

          this.stepperService.next();
        }
      }
  });


  }
}
