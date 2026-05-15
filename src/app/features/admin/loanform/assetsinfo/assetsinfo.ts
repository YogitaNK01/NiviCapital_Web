import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from "../../../systemdesign/inputfield/inputfield";
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Msgboxservice } from '../../../../core/service/msgboxservice';


interface BankOption {
  value: string;
  label: string;
}
@Component({
  selector: 'app-assetsinfo',
  standalone: true,
  imports: [CommonModule, Buttons, Dropdown, Inputfield, ReactiveFormsModule, Datepickernew],
  templateUrl: './assetsinfo.html',
  styleUrl: './assetsinfo.scss'
})
export class Assetsinfo implements OnInit {
  applicantId: any;
  applicationId: any;

  openIndex: number[] = [0];
  accordions1 = [
    { title: 'Gold ', alwaysOpen: true, key: 'gold' },
    { title: 'Liquid Assets ', alwaysOpen: true, key: 'LiquidAssets' },
    { title: 'Property/ Land Assets ', alwaysOpen: true, key: 'Property/LandAssets' },
    { title: 'Fixed Deposit ', alwaysOpen: true, key: 'FixedDeposit' },
    { title: 'Investments ', alwaysOpen: true, key: 'Investments' },

  ];
  accordions: any[] = [];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';

  assetsCatagories: DropdownOption[] = [];
  selectedAssets: any[] = [];
  selectedAssetIds: string[] = [];

  selectedPropertyIds: string[] = [];
  selectPorperty = []

  selectOwnertype: DropdownOption[] = [
    { label: 'Self-owned', value: 'Self-owned', icon: '' },
    { label: 'Joint-owned', value: 'Joint-owned', icon: '' },
    { label: 'Inherited', value: 'Inherited', icon: '' },
  ];

  selectedowner = ''
  selectedownertype: string[] = [];

  selectBanks: BankOption[] = [];
  selectedbankIds: string[] = [];

  selectedInvestmentIds: string[] = [];
  selectInvestments: DropdownOption[] = []

  selectedinvestmentIds: string[] = [];

  assetsForm!: FormGroup;
  selectedAssetLabel: string = '';

  assetOrder: string[] = [
    'GOLD',
    'LIQUID',
    'PROPERTY',
    'FIXED_DEPOSIT',
    'INVESTMENTS',
    'OTHER'
  ];

  groupIdMap: { [key: string]: string[] } = {};
  assetCodeMap: { [key: string]: string } = {};

  totalamount = 0;
  totalINRamt: any;
  totalproperty = 0;
  totalfd = 0;
  totalother = 0;
  totalinvestment = 0;

  selectedbakname!: string;
  invalidamt: boolean = false;;


  assetFieldMap: any = {
    'Gold': { form: 'gold', type: 'group' },
    'Liquid Assets': { form: 'liquidAssets', type: 'group' },
    'Property/ Land Assets': { form: 'properties', type: 'array' },
    'Fixed Deposit': { form: 'fixedDeposits', type: 'array' },
    'Investments': { form: 'investments', type: 'array' },
    'other': { form: 'otherassets', type: 'array' }
  };


  ASSET_KEY_MAP: Record<string, string> = {
    'Gold': 'gold',
    'Liquid Assets': 'liquidAssets',
    'Property/ Land Assets': 'properties',
    'Fixed Deposit': 'fixedDeposits',
    'Investments': 'investments',
    'Other Assets': 'otherassets'
  };

  investmentTypeMap = {
    MutualFunds: 'MUTUAL_FUNDS',
    Shares: 'EQUITY_SHARES',
    Bonds: 'BONDS',
    Others: 'OTHER_INVESTMENTS'
  };
  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private msgBox: Msgboxservice,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.stepperService.rebuildSteps();
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.assetsForm = this.fb.group({
      gold: this.fb.group({
        goldvalue: ['', Validators.required]
      }),


      liquidAssets: this.fb.group({
        cashinhand: ['', Validators.required],
        savingbalance: ['', Validators.required]
      }),

      properties: this.fb.array([this.createProperty()]),

      fixedDeposits: this.fb.array([this.createFD()]),
      investments: this.fb.array([]),

      otherassets: this.fb.array([this.createOther()]),
    });
    this.allAssetCatagory();

    if (this.formSvc.aseetsInfoData) {
      this.patchAssetsData();
    }
      this.assetsForm.valueChanges.subscribe(() => {
    this.calculateGrandTotal();
  });
   

    this.getbanks();
  }

  get f() {
    return this.assetsForm.controls;
  }


  control(path: string) {
    return this.assetsForm.get(path);
  }

  get properties(): FormArray {
    return this.assetsForm.get('properties') as FormArray;
  }

  get fixedDeposits(): FormArray {
    return this.assetsForm.get('fixedDeposits') as FormArray;
  }


  get investmentsArray(): FormArray {
    return this.assetsForm.get('investments') as FormArray;
  }

  get otherassets(): FormArray {
    return this.assetsForm.get('otherassets') as FormArray;
  }

  //properties
  createProperty(): FormGroup {
    return this.fb.group({
      propertytype: ['', Validators.required],
      ownershiptype: ['', Validators.required],
      marketval: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }
  addProperty() {
    this.properties.push(this.createProperty());
  }
  //fixed deposits
  createFD(): FormGroup {
    return this.fb.group({
      bankname: [''],
      title: [''],
      bankamt: ['', [Validators.required, this.nonZeroValidator]],
      maturitydate: ['', [Validators.required, this.dateMinValidator(() => new Date())]]
    });
  }
  addFD() {
    this.fixedDeposits.push(this.createFD());
  }
  //investments

  createInvestment(type: string): FormGroup {

    if (type === 'Others') {
      return this.fb.group({
        type: [type, Validators.required],
        name: ['', Validators.required],
        value: ['', [Validators.required, this.nonZeroValidator]]
      });
    }


    return this.fb.group({
      type: [type, Validators.required],
      value: ['', [Validators.required, this.nonZeroValidator]]
    });
  }


  //Other assets
  createOther(): FormGroup {
    return this.fb.group({
      assettype: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(50)]],
      assetamt: ['', Validators.required],

    });
  }
  addOther() {
    this.otherassets.push(this.createOther());
  }




  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    // this.cd.detectChanges();
  }


  
  removeAccordion(key: string, index: number, event: Event) {
  this.msgBox.open({
    title: 'Are you sure want to Remove',
    message: ``,
    showCancel: true,
    onOk: () => {
      event.stopPropagation();

      this.selectedAssets = this.selectedAssets.filter(k => k !== key);
      this.selectedAssets = [...this.selectedAssets];

      this.openIndex = this.openIndex.filter(i => i !== index);

      switch (key) {
        case 'Gold':
          this.resetGold();
          break;

        case 'Liquid Assets':
          this.resetLiquidAssets();
          break;

        case 'Property/ Land Assets':
          this.properties.clear();
          this.selectedPropertyIds = []; 
          this.properties.push(this.createProperty());
          break;

        case 'Fixed Deposit':
          this.fixedDeposits.clear();
          this.fixedDeposits.push(this.createFD());
          break;

        case 'Investments':
          this.investmentsArray.clear();
          this.selectedInvestmentIds = []; 
          break;

        case 'other':
          this.otherassets.clear();
          this.otherassets.push(this.createOther());
          break;
      }

      this.calculateGrandTotal();
      this.cd.detectChanges();
    }
  });
}

  resetGold() {
    this.assetsForm.setControl(
      'gold',
      this.fb.group({
        goldvalue: ['', Validators.required]
      })
    );
  }

  resetLiquidAssets() {
    this.assetsForm.setControl(
      'liquidAssets',
      this.fb.group({
        cashinhand: ['', Validators.required],
        savingbalance: ['', Validators.required]
      })
    );
  }
  handleAmountInput1(event: any, controlName: string, ctrl?: any) {
    const fg = ctrl as FormGroup;
    const type: string = fg.get('type')?.value || '';
    const isMutualFund = type.toLowerCase().includes('mutual fund');
    const decimalLimit = isMutualFund ? 4 : 2;

    this.main.restrictInput(event, 'decimal', decimalLimit);
    // this.main.restrictInput(event, 'decimal')
    if (ctrl) {
      this.formatAmountfromarray(event, controlName, ctrl);
      ctrl.get(controlName)?.markAsTouched();

    } else {
      this.formatAmount1(event, controlName);
    }

     setTimeout(() => {
    this.calculateGrandTotal();
    this.cd.detectChanges();
  });
  }
handleAmountInput(event: any, controlName: string, ctrl?: any) {
  const type: string = ctrl?.get?.('type')?.value || '';
  const isMutualFund = type.toLowerCase().includes('mutual fund');
  const decimalLimit = isMutualFund ? 4 : 2;

  this.main.restrictInput(event, 'decimal', decimalLimit);

  if (ctrl) {
    this.formatAmountfromarray(event, controlName, ctrl);
    ctrl.get(controlName)?.markAsTouched();
  } else {
    this.formatAmount1(event, controlName);
  }

  setTimeout(() => {
    this.calculateGrandTotal();
    this.cd.detectChanges();
  });
}

  formatIndian1(x: string): string {
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
  formatIndian(x: string): string {
    const parts = x.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1].substring(0, 2) : '';

    if (!integerPart) return '';

    const str = integerPart;
    const len = str.length;

    if (len <= 3) return str + decimalPart;

    const lastThree = str.slice(-3);
    let remaining = str.slice(0, -3);

    remaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

    return remaining + ',' + lastThree + decimalPart;
  }


  // Updated formatAmount - SAFE FOR LARGE NUMBERS
  formatAmount1(event: any, controlName: string) {
    let value = event.target.value;
    if (!value) {
      this.assetsForm.get(controlName)?.setValue('');
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
    this.assetsForm.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  formatAmount(controlName: string) {

    const control = this.assetsForm.get(controlName);
    if (!control) return;

    let value = control.value;

    if (!value) {
      control.setValue('', { emitEvent: false });
      return;
    }

    // remove commas & invalid chars
    value = value.toString().replace(/,/g, '').replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1].slice(0, 2) : '';

   
    if (/^0+$/.test(integerPart)) {
      control.setValue(integerPart + decimalPart, { emitEvent: false });
      return;
    }

    const formatted = this.formatIndian(integerPart + decimalPart);

    control.setValue(formatted, { emitEvent: false });
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
      this.assetsForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }


  submit() {
    if (this.assetsForm.invalid) return;

    console.log(this.assetsForm.value);
  }


 

onAssetChange(values: string | string[]): void {
  const rawSelected = Array.isArray(values) ? values : [values];
  const newSelected = rawSelected.map(v => this.normalizeToAccordionKey(v));

  
 setTimeout(() => {
    this.openIndex = this.selectedAssets
      .map(val => this.accordions.findIndex(a => a.key === val))
      .filter(i => i !== -1);

    this.cd.detectChanges();
  });


  if (newSelected.length === 0) {
    this.selectedAssets = [];
    this.openIndex = [];

    this.assetsForm.get('gold')?.reset();
    this.assetsForm.get('liquidAssets')?.reset();
    this.properties.clear();
    this.fixedDeposits.clear();
    this.otherassets.clear();
    this.investmentsArray.clear();

    this.selectedInvestmentIds = [];
    this.selectedPropertyIds = [];
    this.selectedownertype = [];

    this.calculateGrandTotal();
    this.cd.detectChanges();
    return;
  }

  const deselected = this.selectedAssets.filter(k => !newSelected.includes(k));
  const newlySelected = newSelected.filter(k => !this.selectedAssets.includes(k));

  this.selectedAssets = newSelected;

  this.openIndex = this.selectedAssets
    .map(val => this.accordions.findIndex(a => a.key === val))
    .filter(i => i !== -1);

  // Reset DESELECTED only
  deselected.forEach(key => {
    const config = this.assetFieldMap[key];
    if (!config) return;

    const control = this.assetsForm.get(config.form);

    if (control instanceof FormGroup) {
      control.reset();
    }
    if (control instanceof FormArray) {
      control.clear();
    }

    if (key === 'Investments') {
      this.selectedInvestmentIds = [];
    }
    if (key === 'Property/ Land Assets') {
      this.selectedPropertyIds = [];
    }
  });

  // Initialize NEW selections
  this.selectedAssets.forEach(key => {
    const config = this.assetFieldMap[key];
    if (!config) return;

    const control = this.assetsForm.get(config.form);

    if (control instanceof FormArray && control.length === 0) {
      if (key === 'Property/ Land Assets') control.push(this.createProperty());
      if (key === 'Fixed Deposit') control.push(this.createFD());
      if (key === 'other' || key === 'Other Assets') control.push(this.createOther());
    }
  });

  this.calculateGrandTotal();
  this.cd.detectChanges();
}
  private normalizeToAccordionKey(code: string): string {
    switch (code) {
      case 'GOLD': return 'Gold';
      case 'LIQUID': return 'Liquid Assets';
      case 'PROPERTY': return 'Property/ Land Assets';
      case 'FIXED_DEPOSIT': return 'Fixed Deposit';
      case 'INVESTMENTS': return 'Investments';
      case 'OTHER': return 'Other Assets';
      default: return code;
    }
  }

  
  allAssetCatagory() {
    this.formSvc.getAllAssets().subscribe((res: any) => {
      const list = res.data ?? res;
      console.log("list:", list);

      this.groupIdMap = list.reduce((acc: any, item: any) => {
        if (!acc[item.name]) {
          acc[item.name] = [];
        }
        acc[item.name].push(item.id);
        return acc;
      }, {});

      const uniqueGroups = [...new Set(list.map((s: any) => s.name))];

      const sortedGroups = uniqueGroups.sort(
        (a: any, b: any) =>
          this.assetOrder.indexOf(a) - this.assetOrder.indexOf(b)
      );

      this.assetsCatagories = uniqueGroups.map((group: any) => ({
        value: group,
        label: this.formatTitle(group),
        code: group
      }));

      this.accordions = uniqueGroups.map((group: any) => ({
        title: this.accordianTitle(group),
        alwaysOpen: true,
        key: this.accordianTitle(group)
      }));
      this.assetCodeMap = list.reduce((acc: any, item: any) => {
        acc[item.code] = item.id;
        return acc;
      }, {});

      console.log(this.assetCodeMap);


    });

  }

  accordianTitle(text: string) {

    switch (text) {
      case 'GOLD':
        return 'Gold';
      case 'LIQUID':
        return 'Liquid Assets';
      case 'PROPERTY':
        return 'Property/ Land Assets';
      case 'FIXED_DEPOSIT':
        return 'Fixed Deposit';
      case 'INVESTMENTS':
        return 'Investments';
      case 'OTHER':
        return 'Other Assets';
      default:
        return text;
    }
  }
  formatTitle(text: string): string {

    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  SelectedAssetvalue(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.assetsCatagories.filter(s => ids.includes(s.value));

    this.selectedAssetLabel = selected.map(s => s.label).join(', ');

    console.log("selectedAssetLabel:", this.selectedAssetLabel);
    this.propertyinvestmentasset();
  }

  propertyinvestmentasset() {
    if (this.selectedAssetLabel.includes('Property')) {
      let data = 'PROPERTY_LAND_ASSETS'
      this.formSvc.selectedAssets(data).subscribe((res: any) => {
        const list = res.data ?? res;

        this.selectPorperty = list.map((s: any) => ({
          value: s.id,
          label: s.name,
          code: s.code
        }));

      });
    }
    if (this.selectedAssetLabel.includes('Investments')) {
      let data = 'INVESTMENTS'
      this.formSvc.selectedAssets(data).subscribe((res: any) => {
        const list = res.data ?? res;

        this.selectInvestments = list.map((s: any) => ({
          value: s.id,
          label: s.name,
          code: s.code
        }));


        list.forEach((item: any) => {
          this.assetCodeMap[item.code] = item.id;
        });

      });
      console.log(" this.assetCodeMap investment", this.assetCodeMap);

    }



  }

  onchange(values: string | string[], type: 'property' | 'investment' | 'propertyOwnertype' | 'bank'): void {

    const ids = Array.isArray(values) ? values : [values];
    if (type === 'property') {
      this.selectedPropertyIds = ids;
    }

    else {
      this.selectedownertype = ids;
    }
  }

  onchangeinvestment(selectedIds: any) {

    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      this.investmentsArray.clear();
      this.selectedInvestmentIds = [];
      this.cd.detectChanges();
      return;
    }


    if (selectedIds.length === 0) {
      this.investmentsArray.clear();
      console.log('Investments cleared');
      return;
    }

    // map ids → codes
    const selectedCodes: string[] = selectedIds
      .map(id => this.selectInvestments.find(x => x.value === id)?.label)
      .filter((name): name is string => typeof name === 'string');



    const existingCodes: string[] = this.investmentsArray.controls.map(
      ctrl => ctrl.value?.type
    );


    //  Add newly selected
    selectedCodes.forEach(name => {
      if (!existingCodes.includes(name)) {
        this.investmentsArray.push(
          this.createInvestment(name)
        );
      }
    });

    //  Remove deselected
    for (let i = this.investmentsArray.length - 1; i >= 0; i--) {
      const ctrl = this.investmentsArray.at(i);
      if (!selectedCodes.includes(ctrl.value.type)) {
        this.investmentsArray.removeAt(i);
      }
    }
    this.cd.detectChanges();
    console.log('Investments shown:', this.investmentsArray.value);
  }

 
  removeitem(index: number, type: 'property' | 'fd' | 'other') {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {
        switch (type) {
          case 'property':
            this.properties.removeAt(index);
            break;
          case 'fd':
            this.fixedDeposits.removeAt(index);
            break;
          case 'other':
            this.otherassets.removeAt(index);
            break;
        }
        this.handleEmptyAccordion(type);
        this.calculateGrandTotal();  // Recalc total
      }
    });
  }
  handleEmptyAccordion(type: 'property' | 'fd' | 'other') {
    let array: FormArray;
    let accKey: string;

    switch (type) {
      case 'property':
        array = this.properties;
        accKey = 'Property/ Land Assets';  // Match your acc.key
        break;
      case 'fd':
        array = this.fixedDeposits;
        accKey = 'Fixed Deposit';  // Match acc.key
        break;
      case 'other':
        array = this.otherassets;
        accKey = 'other';  // Match acc.key (lowercase from template)
        break;
    }

    if (array && array.length === 0) {
      // Remove from selectedAssets → hides *ngIf accordion
      this.selectedAssets = this.selectedAssets.filter(k => k !== accKey);
      this.selectedAssets = [...this.selectedAssets];  // Trigger change detection

      // Close accordion
      const accIndex = this.accordions.findIndex(a => a.key === accKey);
      if (accIndex !== -1) {
        this.openIndex = this.openIndex.filter(i => i !== accIndex);
      }
    }
  }

  calculateGrandTotal() {

    const gold = Number(this.assetsForm.get('gold.goldvalue')?.value?.toString().replace(/,/g, '') || 0);

    const liquid = Number(this.assetsForm.get('liquidAssets.cashinhand')?.value?.toString().replace(/,/g, '') || 0) +
      Number(this.assetsForm.get('liquidAssets.savingbalance')?.value?.toString().replace(/,/g, '') || 0);

    this.totalproperty = this.calculateTotal('properties', 'marketval');
    this.totalinvestment = this.calculateTotal('investments', 'value');
    this.totalfd = this.calculateTotal('fixedDeposits', 'bankamt');
    this.totalother = this.calculateTotal('otherassets', 'assetamt');

    this.totalINRamt = gold + liquid + this.totalproperty + this.totalfd + this.totalother + this.totalinvestment;

    this.totalINRamt = this.formatIndian(this.totalINRamt.toString());
  }

  calculateTotal(formArrayName: string, controlName: string): number {

    let total = 0;

    const formArray = this.assetsForm.get(formArrayName) as FormArray;

    formArray.controls.forEach((grp: any) => {
      const val = grp.get(controlName)?.value;

      if (val) {
        const clean = Number(val.toString().replace(/,/g, ''));
        total += clean;
      }
    });

    return total;
  }


  // Add this getter to your component
  get isNextDisabled(): boolean {
    const form = this.assetsForm.value;


    if (!this.selectedAssets?.length) return true;

    if (this.selectedAssets.includes('Gold') && !form.gold?.goldvalue) return true;

    if (this.selectedAssets.includes('Liquid Assets')) {
      const hasLiquidData = form.liquidAssets?.cashinhand || form.liquidAssets?.savingbalance;
      if (!hasLiquidData) return true;
    }


    if (this.selectedAssets.includes('Property/ Land Assets') && this.properties.length === 0) return true;

    if (this.selectedAssets.includes('Fixed Deposit') && this.fixedDeposits.length === 0) return true;
    if (this.selectedAssets.includes('other') && this.otherassets.length === 0) return true;

    if (this.selectedAssets.includes('investments')) {
      const hasInvestmentData = form.investments?.stockvalue || form.investments?.mutualfundvalue;
      if (!hasInvestmentData) return true;
    }


    return false;
  }


  getbanks() {
    this.formSvc.getallBanks().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectBanks = list.map((s: any) => ({
        value: s.id,
        label: s.name,



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



  back() {
    this.stepperService.previous();
  }
  dateMinValidator = (getMinDate: () => Date) => {
    return (control: any) => {
      const value = control.value;
      const minDate = getMinDate();

      if (!value || !minDate) return null;

      const selected = new Date(value);
      const min = new Date(getMinDate());


      selected.setHours(0, 0, 0, 0);
      min.setHours(0, 0, 0, 0);

      return selected < min ? { minDateError: true } : null;

    };
  };

  nonZeroValidator(control: any) {
    const raw = control.value;

    if (!raw) return null;

    const numeric = Number(raw.toString().replace(/,/g, ''));

    return numeric === 0 ? { zeroNotAllowed: true } : null;
  }
  patchAssetsData() {
    const data = this.formSvc.aseetsInfoData;

    if (!data || !data.items) return;

    const items = data.items;


    this.selectedAssets = [];
    this.properties.clear();
    this.fixedDeposits.clear();
    this.otherassets.clear();

    items.forEach((item: any) => {

      const code = Object.keys(this.assetCodeMap)
        .find(key => this.assetCodeMap[key] === item.assetItemMasterId);

      if (!code) return;

      // ---------------- GOLD ----------------
      if (code === 'GOLD') {
        this.selectedAssets.push('GOLD');

        this.assetsForm.get('gold')?.patchValue({
          goldvalue: item.valueInr
        });
      }

      // ---------------- LIQUID ----------------
      if (code === 'LIQUID_CASH') {
        this.selectedAssets.push('LIQUID');

        const liquidGroup = this.assetsForm.get('liquidAssets');

        if (!liquidGroup?.value.cashinhand) {
          liquidGroup?.patchValue({ cashinhand: item.valueInr });
        } else {
          liquidGroup?.patchValue({ savingbalance: item.valueInr });
        }
      }

      // ---------------- PROPERTY ----------------
      if (code === 'PROPERTY') {
        this.selectedAssets.push('PROPERTY');

        const group = this.createProperty();

        group.patchValue({
          propertytype: item.propertyType,
          ownershiptype: item.ownershipType,
          marketval: item.valueInr,
          location: item.location
        });

        this.properties.push(group);
      }

      // ---------------- FD ----------------
      if (code === 'FIXED_DEPOSIT') {
        this.selectedAssets.push('FIXED_DEPOSIT');

        const group = this.createFD();

        group.patchValue({
          bankname: item.bankName,
          bankamt: item.valueInr,
          maturitydate: item.maturityDate
        });

        this.fixedDeposits.push(group);
      }

      // ---------------- INVESTMENTS ----------------
      if (code === 'INVESTMENT') {
        this.selectedAssets.push('INVESTMENTS');

        this.assetsForm.get('investments')?.patchValue({
          stockvalue: item.valueInr
        });
      }

      if (code === 'MUTUAL_FUNDS') {
        this.selectedAssets.push('INVESTMENTS');

        this.assetsForm.get('investments')?.patchValue({
          mutualfundvalue: item.valueInr
        });
      }

      // ---------------- OTHER ----------------
      if (code === 'OTHER') {
        this.selectedAssets.push('OTHER');

        const group = this.createOther();

        group.patchValue({
          assettype: item.assetType,
          assetamt: item.valueInr
        });

        this.otherassets.push(group);
      }

    });

    this.selectedAssets = [...new Set(this.selectedAssets)];


    this.openIndex = [];
    this.selectedAssets.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });


    this.cd.detectChanges();
  }

  next() {
    let form = this.assetsForm.value
    console.log("form data Assets:", form);
    const items: any[] = [];

    let invalid = false;

    const addItem = (code: string, value: any, extra: any = null) => {
      if (!value) return;

      items.push({
        assetItemMasterId: this.assetCodeMap[code],
        valueInr: cleanAmount(value),
        ...extra
      });
    };
    const cleanAmount = (val: any) =>
      val ? Number(val.toString().replace(/,/g, '')) : 0;

    const markInvalid = (path: string) => {
      this.assetsForm.get(path)?.markAsTouched();
      invalid = true;
    };

    //  GOLD
    if (this.selectedAssets.includes('Gold')) {
      const val = form.gold?.goldvalue;
      
      !val ? markInvalid('gold.goldvalue') : addItem('GOLD', val, {
        assetType :'GOLD'
      });
    }

    //  LIQUID
    if (this.selectedAssets.includes('Liquid Assets')) {
      const cash = form.liquidAssets?.cashinhand;
      const savings = form.liquidAssets?.savingbalance;

      !cash ? markInvalid('liquidAssets.cashinhand') : addItem('LIQUID_CASH', cash,{assetType :'Cash In Hand'} );
      !savings ? markInvalid('liquidAssets.savingbalance') : addItem('LIQUID_CASH', savings,{assetType :'Savings Account Balance (INR)'});
    }

    //  PROPERTY (FormArray)
    if (this.selectedAssets.includes('Property/ Land Assets')) {
      const arr = this.assetsForm.get('properties') as FormArray;

      arr.controls.forEach((ctrl: any,index: number) => {
        if (ctrl.invalid) {
          ctrl.markAllAsTouched();
          invalid = true;
          console.log('properties true:');
        } else {
          addItem('PROPERTY', ctrl.value.marketval, {
            propertyId: ctrl.value.propertytype,
            ownershipType: ctrl.value.ownershiptype,
            location: ctrl.value.location,
            assetType :`Property ${index + 1}`
          });
        }
      });
    }



    //  FIXED DEPOSIT (FormArray)
    if (this.selectedAssets.includes('Fixed Deposit')) {
      const arr1 = this.assetsForm.get('fixedDeposits') as FormArray;
      const arr = this.fixedDeposits;
      if (!arr || arr.length === 0) {

        invalid = true;
      }
      else {
        arr.controls.forEach((ctrl: any, index: number) => {
          ctrl.markAllAsTouched();
          if (ctrl.invalid) {

            invalid = true;
            console.log('Fixed Deposit true:'); return

          } else {

            addItem('FIXED_DEPOSIT', ctrl.value.bankamt, {
              bankId: ctrl.value.bankname,
              ...(this.isOtherSelected(ctrl) && { title: ctrl.value.title }),
              maturityDate: (ctrl.value.maturitydate).format('YYYY-MM-DD'),
              assetType : `Fixed Deposit ${index + 1}`
            });
          }
        });
      }
    }



    //  INVESTMENTS 
    if (this.selectedAssets.includes('Investments')) {

      const arr = this.investmentsArray;

      if (!arr || arr.length === 0) {
        invalid = true;
        // return;
      } else {

        arr.controls.forEach((ctrl: any) => {
          ctrl.markAllAsTouched();
          if (ctrl.invalid) {
            ctrl.markAllAsTouched();
            invalid = true;
            console.log('Investment true:');
            return;
          }

          const type = ctrl.value.type == 'Mutual Funds' ? 'MUTUAL_FUNDS' : (ctrl.value.type).toUpperCase();
          const amount = ctrl.value.value;

          if (type === 'Others') {
            addItem('Others', amount, {
              assetType: ctrl.value.name
            });
          }
          else {
            addItem(type, amount,{assetType:type});
          }
        });
      }
    }


    //  Other Assets
    if (this.selectedAssets.includes('Other')) {
      const arr = this.assetsForm.get('otherassets') as FormArray;

      arr.controls.forEach((ctrl: any,) => {
        if (ctrl.invalid) {
          ctrl.markAllAsTouched();
          invalid = true;
          console.log('Other Assets true:');
        } else {
          addItem('OTHER', ctrl.value.assetamt, {
            assetType: ctrl.value.assettype,


          });
        }
      });
    }
    if (invalid || this.invalidamt === true) { console.log("invalid--"); return; }



    const payload = { items };

    console.log("FINAL PAYLOAD:", payload);



    this.formSvc.getAssets(payload, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {
          this.formSvc.aseetsInfoData = payload
          this.stepperService.markStepCompleted('assetsinfo');
          // this.patchAssetsData();
          this.stepperService.next();
        }
      }
    });

  }
}
