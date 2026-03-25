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
    // { label: 'Existing Loans', value: 'ExistingLoans', icon: '' },
    // { label: 'Credit Card Outstanding', value: 'CreditCardOutstanding', icon: '' },
    // { label: 'Buy Now Pay Later (BNPL)', value: 'BuyNowPayLater', icon: '' },
    // { label: 'Other Liabilities', value: 'OtherLiabilities', icon: '' },
  ];
  selectedliabilities: string[] = [];
  selectedlibilitiesIds: string[] = [];
  selectedliabilityLabel = ''
  liabilityForm!: FormGroup;

  liabilityOrder: string[] = [
    'Existing Loans',
    'Credit Card Outstanding',
    'Buy Now Pay Later (BNPL)',
    'Other Liabilities',
  ];


  selectedloantype: string[] = [];
  loanoptions: DropdownOption[] = [];
  selectedloantypeLabel = ''

  groupIdMap: { [key: string]: string[] } = {};
  liabilityCodeMap: { [key: string]: string } = {};

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
      loans: this.fb.array([]),
      creditcard: this.fb.array([this.createCreditcard()]),
      bnpl: this.fb.array([this.createBNPL()]),
      other: this.fb.array([this.createOther()]),

    });

    
    this.alllibilitiy_type();
    this.getloantype();
  }

  get loans(): FormArray {
  return this.liabilityForm.get('loans') as FormArray;
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

  onChange(values: string | string[]): void {
    this.selectedliabilities = Array.isArray(values) ? values : [values];

    const groups = Array.isArray(values) ? values : [values];
    this.selectedliabilities = groups;

    this.selectedlibilitiesIds = groups.flatMap(
      group => this.groupIdMap[group] || []
    );
    console.log("Selected Groups:", this.selectedliabilities);
    console.log("API IDs:", this.selectedlibilitiesIds);

    this.openIndex = [];

    this.selectedliabilities.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
  }

  Selectedvalue(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.liabilitiesCatagories.filter(s => ids.includes(s.value));

    this.selectedliabilityLabel = selected.map(s => s.label).join(', ');

    console.log("selectedliabilityLabel:", this.selectedliabilityLabel);

  }

//existing loans
createLoan(type: string): FormGroup {
   const selected = this.loanoptions.find(l => l.value === type);

  return this.fb.group({
    type: [selected?.label || type],
    bankname: ['', Validators.required],
    outstanding: ['', Validators.required],
    emiamount: ['', Validators.required],
    remtenure: ['', Validators.required]
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

    switch (type) {

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

    removeitem(index: number ,type:'loantype' | 'creditcard' | 'bnpl' | 'other') {


    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
        if (type === 'loantype') {
          const loanArray = this.loans;
          const categoryToRemove = loanArray.at(index).get('type')?.value;

          for (let i = loanArray.length - 1; i >= 0; i--) {
            if (loanArray.at(i).get('type')?.value === categoryToRemove) {
              loanArray.removeAt(i);
            }
          }

          const livcategories = loanArray.controls.map(
            ctrl => ctrl.get('type')?.value
          );
          this.selectedloantype = [...new Set(livcategories)];
        }

         if (type === 'creditcard') {
        this.creditcard.removeAt(index);
      }

      if (type === 'bnpl') {
        this.bnpl.removeAt(index);
      }

      if (type === 'other') {
        this.other.removeAt(index);
      }

       

      }
    });
  }

  alllibilitiy_type() {
    this.formSvc.getAllLiabilities().subscribe((res: any) => {
      const list = res.data ?? res;

      this.groupIdMap = list.reduce((acc: any, item: any) => {
        if (!acc[item.code]) {
          acc[item.code] = [];
        }
        acc[item.code].push(item.id);
        return acc;
      }, {});

      const uniqueGroups = [...new Set(list.map((s: any) => s.code))];
      //sort as per design
      const sortedGroups = uniqueGroups.sort(
        (a: any, b: any) =>
          this.liabilityOrder.indexOf(a) - this.liabilityOrder.indexOf(b)
      );
      this.liabilitiesCatagories = uniqueGroups.map((a: any) => ({
        value: a,
        label: this.formatTitle(a),
        code: a
      }));

      this.accordions = sortedGroups.map((group: any) => ({
        title: this.accordianTitle(group),
        alwaysOpen: true,
        key: group
      }));
      this.liabilityCodeMap = list.reduce((acc: any, item: any) => {
        acc[item.code] = item.id;
        return acc;
      }, {});

    });
  }


  formatTitle(text: string): string {

    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  accordianTitle(text: string) {

    switch (text) {
      case 'EXISTING_LOAN':
        return 'Existing Loans';
      case 'CREDIT_CARD_OUTSTANDING':
        return 'Credit Card Outstanding';
      case 'BNPL':
        return 'Buy Now Pay Later (BNPL)';
      case 'OTHER_LIABILITY':
        return 'Other Liabilities';
      default:
        return text;
    }
  }


  getloantype(){
    this.formSvc.getloan_type().subscribe((res: any) => {
      const list = res.data ?? res;
      this.loanoptions = list.map((s: any) => s.code);
      console.log("loanoptions",this.loanoptions);

       this.loanoptions = list.map((a: any) => ({
        value: a.id,
        label: a.name,
        code: a.code
      }));


      
    });
  }

  onLoanChange(values: string | string[]): void {
    const groups = Array.isArray(values) ? values : [values];
    this.selectedloantype = groups;

     this.loans.clear();
     groups.forEach(type => {
    this.loans.push(this.createLoan(type));
  });
  }

  Selectedloanvalue(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];
    const selected = this.loanoptions.filter(s => ids.includes(s.value));
    this.selectedloantypeLabel = selected.map(s => s.label).join(', ');
    console.log("selectedloantypeLabel:", this.selectedloantypeLabel);
  }
  back() {
    this.stepperService.previous();
  }


  
  next() {
    let form = this.liabilityForm.value
    console.log("form data Assets:", form);
    const items: any[] = [];

    let invalid = false;

     const addItem = (code: string, value: any, extra: any = null) => {
    if (!value) return;

    items.push({
      assetItemMasterId: this.liabilityCodeMap[code],
      valueInr: Number(value),
      ...extra 
    });
  };

  const markInvalid = (path: string) => {
    this.liabilityForm.get(path)?.markAsTouched();
    invalid = true;
  };

  // ✅ EXISTING LOANS
  if (this.selectedliabilities.includes('ExistingLoans')) {
    if (this.loans.length === 0) {
      invalid = true;
    }

    this.loans.controls.forEach((loan: any) => {
      if (loan.invalid) {
        loan.markAllAsTouched();
        invalid = true;
      } else {
        items.push({
          type: loan.value.type,
          bankName: loan.value.bankname,
          outstanding: Number(loan.value.outstanding),
          emi: Number(loan.value.emiamount),
          tenure: loan.value.remtenure
        });
      }
    });
  }

  // ✅ CREDIT CARD
  if (this.selectedliabilities.includes('CreditCardOutstanding')) {
    if (this.creditcard.length === 0) invalid = true;

    this.creditcard.controls.forEach((card: any) => {
      if (card.invalid) {
        card.markAllAsTouched();
        invalid = true;
      } else {
        items.push({
          type: 'CREDIT_CARD',
          bankName: card.value.creditcardbankName,
          outstanding: Number(card.value.ccoutstandingBalance),
          limit: Number(card.value.creditLimit)
        });
      }
    });
  }

  // ✅ BNPL
  if (this.selectedliabilities.includes('BuyNowPayLater')) {
    if (this.bnpl.length === 0) invalid = true;

    this.bnpl.controls.forEach((bnpl: any) => {
      if (bnpl.invalid) {
        bnpl.markAllAsTouched();
        invalid = true;
      } else {
        items.push({
          type: 'BNPL',
          bankName: bnpl.value.bnplbankName,
          outstanding: Number(bnpl.value.outstandingBalance),
          limit: Number(bnpl.value.creditLimit),
          emi: Number(bnpl.value.monthlyEMI)
        });
      }
    });
  }

  // ✅ OTHER
  if (this.selectedliabilities.includes('OtherLiabilities')) {
    if (this.other.length === 0) invalid = true;

    this.other.controls.forEach((other: any) => {
      if (other.invalid) {
        other.markAllAsTouched();
        invalid = true;
      } else {
        items.push({
          type: other.value.LiabilityType,
          amount: Number(other.value.amount),
          emi: Number(other.value.MonthlyRepaymentimit)
        });
      }
    });
  }



  if (invalid) return;


  const payload = { items };

  console.log("FINAL PAYLOAD:", payload);

    

     this.formSvc.getAssets(payload, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {

          this.stepperService.next();
        }
      }
    });

  }

}
