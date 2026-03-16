import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';

@Component({
  selector: 'app-liabilitiesinfo',
  imports: [CommonModule, ReactiveFormsModule, Buttons, Dropdown, Inputfield],
  standalone: true,
  templateUrl: './liabilitiesinfo.html',
  styleUrl: './liabilitiesinfo.scss'
})
export class Liabilitiesinfo {

  applicantId: any;
  applicationId: any;

  openIndex: number[] = [0];
  accordions = [
    { title: 'Existing Loans ', alwaysOpen: true, key: 'ExistingLoans' },
    { title: 'Credit Card Outstanding ', alwaysOpen: true, key: 'CreditCardOutstanding' },
    { title: 'Buy Now Pay Later (BNPL)', alwaysOpen: true, key: 'BuyNowPayLater' },
    { title: 'Other Liabilities', alwaysOpen: true, key: 'OtherLiabilities' },
  ];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';
  liabilitiesCatagories: DropdownOption[] = [
    { label: 'Existing Loans', value: 'ExistingLoans', icon: '' },
    { label: 'Credit Card Outstanding', value: 'CreditCardOutstanding', icon: '' },
    { label: 'Buy Now Pay Later (BNPL)', value: 'BuyNowPayLater', icon: '' },
    { label: 'Other Liabilities', value: 'OtherLiabilities', icon: '' },
  ];
  selectedliabilities: string[] = [];

  liabilityForm!: FormGroup;

  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private msgBox: Msgboxservice,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.liabilityForm = this.fb.group({


      // existinloans: this.fb.array([]),
      creditcard: this.fb.array([this.createCreditcard()]),
      bnpl: this.fb.array([this.createBNPL()]),
      other: this.fb.array([this.createOther()]),

    });

  }

  get creditcard(): FormArray {
    return this.liabilityForm.get('creditcard') as FormArray;
  }

  get bnpl(): FormArray {
    return this.liabilityForm.get('bnpl') as FormArray;
  }
  get other(): FormArray {
    return this.liabilityForm.get('other') as FormArray;
  }

  getFormArray(name: string): FormArray {
  return this.liabilityForm.get(name) as FormArray;
}

  onAssetChange(values: string | string[]): void {
    this.selectedliabilities = Array.isArray(values) ? values : [values];

    this.openIndex = [];

    this.selectedliabilities.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
  }

  //credit card Liabilities
  createCreditcard(): FormGroup {
    return this.fb.group({
      creditcardbankName: ['', Validators.required],
      ccoutstandingBalance: ['', Validators.required],
      creditLimit: ['', Validators.required],
    });
  }
  addCard() {
    this.creditcard.push(this.createCreditcard());
  }


  // bnpl Liabilities
  createBNPL(): FormGroup {
    return this.fb.group({
      bnplbankName: ['', Validators.required],
      outstandingBalance: ['', Validators.required],
      creditLimit: ['', Validators.required],
      monthlyEMI: ['', Validators.required],
    });
  }
  addBNPL() {
    this.bnpl.push(this.createBNPL());
  }




  // other Liabilities
  createOther(): FormGroup {
    return this.fb.group({
      LiabilityType: ['', Validators.required],
      amount: ['', Validators.required],
      MonthlyRepaymentimit: ['', Validators.required],
    });
  }
  addOther() {
    this.other.push(this.createOther());
  }

// common function for adding new data

addRow(arrayName: string, createFn: () => FormGroup) {
  const arr = this.getFormArray(arrayName);
console.log(arr.length);
  const last = arr.at(arr.length - 1);

  arr.push(createFn());
  this.cd.detectChanges(); 
}
createEmptyRow(type: string): FormGroup {

  switch(type) {

    case 'creditcard':
      return this.createCreditcard();

    case 'bnpl':
      return this.createBNPL();

    case 'other':
      return this.createOther();

    default:
      return this.fb.group({});
  }

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
    if (this.liabilityForm.invalid) return;

    console.log(this.liabilityForm.value);
  }

  removeAccordion1(key: string, index: number, event: Event) {

    event.stopPropagation(); 

    this.selectedliabilities =
      this.selectedliabilities.filter(k => k !== key);

    this.openIndex =
      this.openIndex.filter(i => i !== index);

    this.liabilityForm.get(key)?.reset();

  }

removeAccordion(key: string, index: number, event: Event) {

  event.stopPropagation();

  this.selectedliabilities =
    this.selectedliabilities.filter(k => k !== key);

  this.openIndex =
    this.openIndex.filter(i => i !== index);

  const map: any = {
    CreditCardOutstanding: 'creditcard',
    BuyNowPayLater: 'bnpl',
    OtherLiabilities: 'other'
  };

  const control = this.liabilityForm.get(map[key]);

  if (control instanceof FormArray) {
    control.clear();
    control.push(this.createEmptyRow(map[key]));
  }

}

  back() {
    this.stepperService.previous();
  }


  next() {
    this.stepperService.next();
  }

}
