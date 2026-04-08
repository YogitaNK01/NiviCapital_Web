import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { Title } from '@angular/platform-browser';

interface BankOption {
  value: string;
  label: string;
}
interface LiabilityOption {
  code: string;
  name: string;
  id: string;
  displayOrder?: number;
}

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
  selectedliabilities1: LiabilityOption[] = [];
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

  c: any;
  totalloans = 0;
  totalcc = 0;
  totalbnpl = 0;
  totalother = 0;
  totalINRamt: any;

  selectBanks: BankOption[] = [];
  selectedbankIds: string[] = [];

  selectedbakname!: string;

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

    if (this.formSvc.liabilitiesInfoData) {

    }
    this.liabilityForm.get('loans')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
    this.liabilityForm.get('creditcard')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();

    });

    this.liabilityForm.get('bnpl')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.liabilityForm.get('other')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });


    this.alllibilitiy_type();
    this.getloantype();
    this.getbanks();
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
      remtenure: ['', Validators.required],
      title: ['']
    });
  }

  //credit card Liabilities
  createCreditcard(): FormGroup {
    return this.fb.group({
      creditcardbankName: ['', Validators.required],
      title: [''],
      ccoutstandingBalance: ['', Validators.required],
      cccreditLimit: ['', Validators.required],
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

  getbanks() {
    this.formSvc.getallBanks().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectBanks = list.map((s: any) => ({
        value: s.id,
        label: s.name,
        code: s.code
      }));

    });
  }

  onBankSelected(selectedId: any, fd: AbstractControl) {
    const fg = fd as FormGroup;

    const found = this.selectBanks.find(
      (b: BankOption) => b.value === selectedId
    );
    const bankLabel = found?.label ?? '';
    this.selectedbakname = bankLabel;

    const titleCtrl = fg.get('title');

    if (bankLabel === 'Other') {
      titleCtrl?.setValidators([Validators.required]);
    } else {
      titleCtrl?.clearValidators();
      titleCtrl?.setValue('');
    }

    titleCtrl?.updateValueAndValidity();
  }


  isOtherSelected(fd: AbstractControl): boolean {
    const selectedId = fd.get('bankname')?.value;
    const found = this.selectBanks.find(b => b.value === selectedId);
    return found?.label === 'Other';
  }

  isOtherSelected1(fd: AbstractControl): boolean {
    const selectedId = fd.get('creditcardbankName')?.value;
    const found = this.selectBanks.find(b => b.value === selectedId);
    return found?.label === 'Other';
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
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
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
        switch (key) {


          case 'loans':
            this.loans.clear();
           break;

          case 'creditcard':
            this.creditcard.clear();
            this.creditcard.push(this.createCreditcard());
            break;

          case 'bnpl':
            this.bnpl.clear();
            this.bnpl.push(this.createBNPL());
            break;

          case 'other':
            this.other.clear();
            this.other.push(this.createOther());
            break;
        }
      }
    });
  }

  removeitem1(index: number, type: 'loantype' | 'creditcard' | 'bnpl' | 'other') {


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

    removeitem(index: number, type: 'loantype' | 'creditcard' | 'bnpl' | 'other') {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
        switch (type) {
          case 'loantype':
            this.loans.removeAt(index);
            break;
          case 'creditcard':
            this.creditcard.removeAt(index);
            break;
          case 'bnpl':
            this.bnpl.removeAt(index);
            break;
             case 'other':
            this.other.removeAt(index);
            break;
        }
        this.handleEmptyAccordion(type);
        this.calculateGrandTotal();  // Recalc total
      }
    });
  }
   handleEmptyAccordion(type: 'loantype' | 'creditcard' | 'bnpl' | 'other') {
    let array: FormArray;
    let accKey: string;

    switch (type) {
      case 'loantype':
        array = this.loans;
        accKey = 'Property/Land Assets';  // Match your acc.key
        break;
      case 'creditcard':
        array = this.creditcard;
        accKey = 'Credit Card';  // Match acc.key
        break;
      case 'bnpl':
        array = this.bnpl;
        accKey = 'Buy Now Pay Later';  // Match acc.key
        break;
      case 'other':
        array = this.other;
        accKey = 'other';  // Match acc.key (lowercase from template)
        break;
    }

    if (array && array.length === 0) {
      // Remove from selectedliabilities → hides *ngIf accordion
      this.selectedliabilities = this.selectedliabilities.filter(k => k !== accKey);
      this.selectedliabilities = [...this.selectedliabilities];  // Trigger change detection

      // Close accordion
      const accIndex = this.accordions.findIndex(a => a.key === accKey);
      if (accIndex !== -1) {
        this.openIndex = this.openIndex.filter(i => i !== accIndex);
      }
    }
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
      this.liabilitiesCatagories = list.map((a: any) => ({
        value: a,
        label: a.name,//this.formatTitle(a),
        code: a
      }));

      this.accordions = list.map((group: any) => ({
        // title: group.name ,
        title: this.accordianTitle(group.code),
        alwaysOpen: true,
        key: group
      }));
      this.liabilityCodeMap = list.reduce((acc: any, item: any) => {
        acc[item.code] = item.code;
        return acc;
      }, {});
      console.log("this.liabilityCodeMap--", this.liabilityCodeMap);

      // this.patchLiabilitiesData();
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


  getloantype() {
    this.formSvc.getloan_type().subscribe((res: any) => {
      const list = res.data ?? res;
      this.loanoptions = list.map((s: any) => s.code);
      console.log("loanoptions", this.loanoptions);

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

  calculateGrandTotal() {

    this.totalloans = this.calculateTotal('loans', 'outstanding');
    this.totalcc = this.calculateTotal('creditcard', 'ccoutstandingBalance') + this.calculateTotal('creditcard', 'cccreditLimit');
    this.totalbnpl = this.calculateTotal('bnpl', 'outstandingBalance') + this.calculateTotal('bnpl', 'creditLimit') + this.calculateTotal('bnpl', 'monthlyEMI');
    this.totalother = this.calculateTotal('other', 'amount') + this.calculateTotal('other', 'MonthlyRepaymentLimit');

    const total =
      this.totalloans +
      this.totalcc +
      this.totalbnpl +
      this.totalother;

    this.totalINRamt = this.formatIndian(total.toString());
  }

  calculateTotal(formArrayName: string, controlName: string): number {

    let total = 0;

    const formArray = this.liabilityForm.get(formArrayName) as FormArray;

    formArray.controls.forEach((grp: any) => {
      const val = grp.get(controlName)?.value;

      if (val) {
        const clean = Number(val.toString().replace(/,/g, ''));
        total += clean;
      }
    });

    return total;
  }

  handleAmountInput(event: any, controlName: string, ctrl?: any) {
    this.main.restrictInput(event, 'decimal');
    if (ctrl) {
      this.formatAmountfromarray(event, controlName, ctrl);
    } else {
      this.formatAmount(event, controlName);
    }


  }
  formatIndian(x: string): string {
    const parts = x.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1].substring(0, 2) : '';

    if (!integerPart || integerPart === '0') return '0' + decimalPart;

    const bigIntValue = BigInt(integerPart);
    let str = bigIntValue.toString();
    let length = str.length;

    let groups: string[] = [];

    let lastGroup = str.substring(Math.max(0, length - 3), length);
    groups.unshift(lastGroup);

    let remaining = str.substring(0, Math.max(0, length - 3));
    for (let i = remaining.length; i > 0; i -= 2) {
      let start = Math.max(0, i - 2);
      let group = remaining.substring(start, i).replace(/^0+/, '') || '0';
      groups.unshift(group);
    }

    return groups.join(',') + decimalPart;
  }



  // Updated formatAmount - SAFE FOR LARGE NUMBERS
  formatAmount(event: any, controlName: string) {
    let value = event.target.value;
    if (!value) {
      this.liabilityForm.get(controlName)?.setValue('');
      return;
    }

    value = value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex > 3) {
      value = value.substring(0, decimalIndex + 3);
    }

    const formatted = this.formatIndian(value);
    this.liabilityForm.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  // Updated formatAmountfromarray
  formatAmountfromarray(event: any, controlName: string, control: AbstractControl) {
    let value = event.target.value;
    if (!value) return;

    // Same cleaning logic
    value = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex > 3) {
      value = value.substring(0, decimalIndex + 3);
    }

    const formatted = this.formatIndian(value);

    if (control && (control as FormGroup)?.get(controlName)) {
      (control as FormGroup).get(controlName)?.setValue(formatted, { emitEvent: false });
    } else {
      this.liabilityForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }

  //format amount 2000000 to 20,00,000
  formatAmount1(event: any, controlName: string) {
    let value = event.target.value;
    if (!value) return;
    value = value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    let integerPart = parts[0];
    let decimalPart = parts[1] ? '.' + parts[1] : '';

    let num = Number(value);
    const formatted = this.formatIndian(num.toString());
    this.liabilityForm.get(controlName)?.setValue(formatted, { emitEvent: false });


  }

  formatAmountfromarray1(event: any, controlName: string, control: AbstractControl) {
    const group = control as FormGroup;
    let value = event.target.value;

    if (!value) return;

    value = value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    let integerPart = parts[0];
    let decimalPart = parts[1] ? '.' + parts[1] : '';


    let num = Number(value);



    const formatted = this.formatIndian(num.toString());

    if (group) {
      group.get(controlName)?.setValue(formatted, { emitEvent: false });
    } else {
      this.liabilityForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }

  }


  formatIndian1(x: string): string {
    return new Intl.NumberFormat('en-IN').format(Number(x));
  }
  patchLiabilitiesData() {
    const data = this.formSvc.liabilitiesInfoData;

    if (!data || !data.items) return;

    const items = data.items;

    this.selectedliabilities = [];
    this.loans.clear();
    this.creditcard.clear();
    this.bnpl.clear();
    this.other.clear();

    items.forEach((item: any) => {

      // ---------------- EXISTING LOANS ----------------
      if (item.type && item.bankName && item.emi !== undefined && item.tenure) {

        this.selectedliabilities.push('ExistingLoans');

        const group = this.createLoan(item.type);

        group.patchValue({
          type: item.type,
          bankname: item.bankName,
          outstanding: item.outstanding,
          emiamount: item.emi,
          remtenure: item.tenure
        });

        this.loans.push(group);
      }

      // ---------------- CREDIT CARD ----------------
      if (item.type === 'CREDIT_CARD') {

        this.selectedliabilities.push('CreditCardOutstanding');

        const group = this.createCreditcard();

        group.patchValue({
          creditcardbankName: item.bankName,
          ccoutstandingBalance: item.outstanding,
          creditLimit: item.limit
        });

        this.creditcard.push(group);
      }

      // ---------------- BNPL ----------------
      if (item.type === 'BNPL') {

        this.selectedliabilities.push('BuyNowPayLater');

        const group = this.createBNPL();

        group.patchValue({
          bnplbankName: item.bankName,
          outstandingBalance: item.outstanding,
          creditLimit: item.limit,
          monthlyEMI: item.emi
        });

        this.bnpl.push(group);
      }

      // ---------------- OTHER ----------------
      if (!item.bankName && item.amount !== undefined) {

        this.selectedliabilities.push('OtherLiabilities');

        const group = this.createOther();

        group.patchValue({
          LiabilityType: item.type,
          amount: item.amount,
          MonthlyRepaymentimit: item.emi
        });

        this.other.push(group);
      }

    });

    this.selectedliabilities = [...new Set(this.selectedliabilities)];

    this.openIndex = [];
    this.selectedliabilities.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });

    if (this.creditcard.length === 0) this.creditcard.push(this.createCreditcard());
    if (this.bnpl.length === 0) this.bnpl.push(this.createBNPL());
    if (this.other.length === 0) this.other.push(this.createOther());

    this.cd.detectChanges();
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

    //  EXISTING LOANS
    // if (this.selectedliabilities.includes('EXISTING_LOAN')) {
        if (this.selectedliabilities.some((l: any) => l.code === 'EXISTING_LOAN')) {

      if (this.loans.length === 0) {
        invalid = true;
      }

      this.loans.controls.forEach((loan: any) => {
        if (loan.invalid) {
          loan.markAllAsTouched();
          invalid = true;
        } else {
          items.push({
            liabilityType: "EXISTING_LOAN",
            bankName: loan.value.bankname,
            ...(this.isOtherSelected(loan) && { title: loan.value.title }),
            outstandingBalanceInr: Number(loan.value.outstanding),
            emiAmountInr: Number(loan.value.emiamount),
            remainingTenureMonths: loan.value.remtenure
          });
        }
      });
    }

    //  CREDIT CARD
    if (this.selectedliabilities.some((l: any) => l.code === 'CREDIT_CARD_OUTSTANDING')) {
      if (this.creditcard.length === 0) invalid = true;

      this.creditcard.controls.forEach((card: any) => {
        if (card.invalid) {
          card.markAllAsTouched();
          invalid = true;
        } else {
          items.push({
            liabilityType: 'CREDIT_CARD_OUTSTANDING',
            bankName: card.value.creditcardbankName,
            ...(this.isOtherSelected(card) && { title: card.value.title }),
            outstandingBalanceInr: Number(card.value.ccoutstandingBalance),
            creditLimitInr: Number(card.value.cccreditLimit)
          });
        }
      });
    }




    //  BNPL
    // if (this.selectedliabilities.includes('BNPL')) {
        if (this.selectedliabilities.some((l: any) => l.code === 'BNPL')) {
      if (this.bnpl.length === 0) invalid = true;

      this.bnpl.controls.forEach((bnpl: any) => {
        if (bnpl.invalid) {
          bnpl.markAllAsTouched();
          invalid = true;
        } else {
          items.push({
            liabilityType: 'BNPL',
            bankName: bnpl.value.bnplbankName,
            outstandingBalanceInr: Number(bnpl.value.outstandingBalance),
            creditLimitInr: Number(bnpl.value.creditLimit),
            monthlyEmiInr: Number(bnpl.value.monthlyEMI)
          });
        }
      });
    }

    //  OTHER
        if (this.selectedliabilities.some((l: any) => l.code === 'OTHER_LIABILITY')) {
      if (this.other.length === 0) invalid = true;

      this.other.controls.forEach((other: any) => {
        if (other.invalid) {
          other.markAllAsTouched();
          invalid = true;
        } else {
          items.push({
            liabilityType: "OTHER_LIABILITY",
            liabilityTypeText: other.value.LiabilityType,
            amountInr: Number(other.value.amount),
            monthlyRepaymentInr: Number(other.value.MonthlyRepaymentimit)
          });
        }
      });
    }



    if (invalid) return;


    const payload = { items };

    console.log("FINAL PAYLOAD:", payload);



    this.formSvc.submitliability(payload, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {
          this.formSvc.liabilitiesInfoData = payload
          this.stepperService.next();
        }
      }
    });

  }

}
