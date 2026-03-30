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
  totalother = 0

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

      investments: this.fb.group({
        stockvalue: ['', Validators.required],
        mutualfundvalue: ['', Validators.required]
      }),
      otherassets: this.fb.array([this.createOther()]),
    });
    this.allAssetCatagory();

    if (this.formSvc.aseetsInfoData) {
      this.patchAssetsData();
    }
    this.assetsForm.get('gold.goldvalue')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
    this.assetsForm.get('liquidAssets')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
    this.assetsForm.get('properties')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();

    });

    this.assetsForm.get('fixedDeposits')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

    this.assetsForm.get('otherassets')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
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

  get otherassets(): FormArray {
    return this.assetsForm.get('otherassets') as FormArray;
  }
  //properties
  createProperty(): FormGroup {
    return this.fb.group({
      propertytype: ['', Validators.required],
      ownershiptype: ['', Validators.required],
      marketval: ['', Validators.required],
      location: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]]
    });
  }
  addProperty() {
    this.properties.push(this.createProperty());
  }
  //fixed deposits
  createFD(): FormGroup {
    return this.fb.group({
      bankname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      bankamt: ['', Validators.required],
      maturitydate: ['',[Validators.required,this.dateMinValidator(() => new Date())]]
    });
  }
  addFD() {
    this.fixedDeposits.push(this.createFD());
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
    this.cd.detectChanges();
  }

  removeAccordion1(key: string, index: number, event: Event) {

    event.stopPropagation();

    this.selectedAssets =
      this.selectedAssets.filter(k => k !== key);

    this.openIndex =
      this.openIndex.filter(i => i !== index);

    this.assetsForm.get(key)?.reset();

  }

  removeAccordion(key: string, index: number, event: Event) {
 this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
    event.stopPropagation();

    this.selectedAssets = this.selectedAssets.filter(k => k !== key);

    this.selectedAssetIds = this.selectedAssets.flatMap(
      group => this.groupIdMap[group] || []
    );

    this.openIndex = this.openIndex.filter(i => i !== index);

    const formKeyMap: any = {
      GOLD: 'gold',
      LIQUID: 'liquidAssets',
      PROPERTY: 'properties',
      FIXED_DEPOSIT: 'fixedDeposits',
      INVESTMENTS: 'investments',
      OTHERS: 'others'
    };

    this.assetsForm.get(formKeyMap[key])?.reset();
  }
})
  }

   handleAmountInput(event: any, controlName: string, ctrl?: any) {
    this.main.restrictInput(event, 'decimal');
    if (ctrl) {
      this.formatAmountfromarray(event, controlName, ctrl);
    } else {
      this.formatAmount(event, controlName);
    }


  }

  //format amount 2000000 to 20,00,000
  formatAmount(event: any, controlName: string) {
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
    this.assetsForm.get(controlName)?.setValue(formatted, { emitEvent: false });


  }

  formatAmountfromarray(event: any, controlName: string, control: AbstractControl) {
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
      this.assetsForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }

  }


 

  submit() {
    if (this.assetsForm.invalid) return;

    console.log(this.assetsForm.value);
  }

  onAssetChange1(values: string | string[]): void {
    const ids = Array.isArray(values) ? values : [values];
    this.selectedAssetIds = ids;
    const selected = this.assetsCatagories.filter(s => ids.includes(s.value));

    this.selectedAssets = [...new Set(selected.map(s => s.code))];
    this.openIndex = [];

    this.selectedAssets.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
  }
  onAssetChange(values: string | string[]): void {

    const groups = Array.isArray(values) ? values : [values];
    this.selectedAssets = groups;
    // const merged = [...this.selectedAssets, ...incoming];

    // this.selectedAssets = [...new Set(merged)];

    // this.selectedAssetIds = this.selectedAssets.flatMap(
    //   group => this.groupIdMap[group] || []
    // );

    this.selectedAssetIds = groups.flatMap(
      group => this.groupIdMap[group] || []
    );
    console.log("Selected Groups:", this.selectedAssets);
    console.log("API IDs:", this.selectedAssetIds);

    this.openIndex = [];

    this.selectedAssets.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
  }

  allAssetCatagory() {
    this.formSvc.getAllAssets().subscribe((res: any) => {
      const list = res.data ?? res;

      this.groupIdMap = list.reduce((acc: any, item: any) => {
        if (!acc[item.assetGroup]) {
          acc[item.assetGroup] = [];
        }
        acc[item.assetGroup].push(item.id);
        return acc;
      }, {});

      const uniqueGroups = [...new Set(list.map((s: any) => s.assetGroup))];

      const sortedGroups = uniqueGroups.sort(
        (a: any, b: any) =>
          this.assetOrder.indexOf(a) - this.assetOrder.indexOf(b)
      );

      this.assetsCatagories = uniqueGroups.map((group: any) => ({
        value: group,
        label: this.formatTitle(group),
        code: group
      }));

      this.accordions = sortedGroups.map((group: any) => ({
        title: this.accordianTitle(group),
        alwaysOpen: true,
        key: group
      }));
      this.assetCodeMap = list.reduce((acc: any, item: any) => {
        acc[item.code] = item.id;
        return acc;
      }, {});


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
      let data = 'PROPERTY'
      this.formSvc.selectedAssets(data).subscribe((res: any) => {
        const list = res.data ?? res;

        this.selectPorperty = list.map((s: any) => ({
          value: s.id,
          label: s.assetGroup,
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
          label: s.code,
          code: s.code
        }));

      });
    }



  }

  onchange(values: string | string[], type: 'property' | 'investment' | 'propertyOwnertype'): void {

    const ids = Array.isArray(values) ? values : [values];
    if (type === 'property') {
      this.selectedPropertyIds = ids;
    } else if (type === 'investment') {
      this.selectedInvestmentIds = ids;
    } else {
      this.selectedownertype = ids;
    }
  }


  removeitem(index: number, type: 'property' | 'fd' | 'other') {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
        if (type === 'property') {
          const loanArray = this.properties;
          const categoryToRemove = loanArray.at(index).get('type')?.value;

          for (let i = loanArray.length - 1; i >= 0; i--) {
            if (loanArray.at(i).get('type')?.value === categoryToRemove) {
              if (loanArray.length === 1) return;
              loanArray.removeAt(i);
            }
          }

          const livcategories = loanArray.controls.map(
            ctrl => ctrl.get('type')?.value
          );
          this.selectedAssets = [...new Set(livcategories)];
        }

        if (type === 'fd') {
          if (this.fixedDeposits.length === 1) {
            // this.showError('At least one FD is required');
            return;
          }
          this.fixedDeposits.removeAt(index);
        }


        if (type === 'other') {
          this.otherassets.removeAt(index);
        }



      }
    });
  }

  calculateGrandTotal() {

    const gold = Number(this.assetsForm.get('gold.goldvalue')?.value?.toString().replace(/,/g, '') || 0);

    const liquid = Number(this.assetsForm.get('liquidAssets.cashinhand')?.value?.toString().replace(/,/g, '') || 0) +
      Number(this.assetsForm.get('liquidAssets.savingbalance')?.value?.toString().replace(/,/g, '') || 0);

    this.totalproperty = this.calculateTotal('properties', 'marketval');
    this.totalfd = this.calculateTotal('fixedDeposits', 'bankamt');
    this.totalother = this.calculateTotal('otherassets', 'assetamt');

    this.totalINRamt = gold + liquid + this.totalproperty + this.totalfd + this.totalother;

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
  formatIndian(x: string): string {
    return new Intl.NumberFormat('en-IN').format(Number(x));
  }

  // Add this getter to your component
get isNextDisabled(): boolean {
  const form = this.assetsForm.value;
  
 
  if (!this.selectedAssets?.length) return true;
  
  if (this.selectedAssets.includes('GOLD') && !form.gold?.goldvalue) return true;
  
  if (this.selectedAssets.includes('LIQUID')) {
    const hasLiquidData = form.liquidAssets?.cashinhand || form.liquidAssets?.savingbalance;
    if (!hasLiquidData) return true;
  }
  
  if (this.selectedAssets.includes('PROPERTY')) {
    const properties = this.assetsForm.get('properties') as FormArray;
    if (!properties?.length) return true;
  }
  
  if (this.selectedAssets.includes('FIXED_DEPOSIT')) {
    const fixedDeposits = this.assetsForm.get('fixedDeposits') as FormArray;
    if (!fixedDeposits?.length) return true;
  }
  
  if (this.selectedAssets.includes('INVESTMENTS')) {
    const hasInvestmentData = form.investments?.stockvalue || form.investments?.mutualfundvalue;
    if (!hasInvestmentData) return true;
  }
  
  if (this.selectedAssets.includes('OTHER')) {
    const otherAssets = this.assetsForm.get('otherassets') as FormArray;
    if (!otherAssets?.length) return true;
  }
  
  return false;
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
      if (code === 'LIQUID_SAVINGS') {
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
      if (code === 'STOCKS') {
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
      if (code === 'OTHER_ASSETS') {
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
        valueInr: Number(value),
        ...extra
      });
    };

    const markInvalid = (path: string) => {
      this.assetsForm.get(path)?.markAsTouched();
      invalid = true;
    };

    //  GOLD
    if (this.selectedAssets.includes('GOLD')) {
      const val = form.gold?.goldvalue;
      !val ? markInvalid('gold.goldvalue') : addItem('GOLD', val);
    }

    //  LIQUID
    if (this.selectedAssets.includes('LIQUID')) {
      const cash = form.liquidAssets?.cashinhand;
      const savings = form.liquidAssets?.savingbalance;

      !cash ? markInvalid('liquidAssets.cashinhand') : addItem('LIQUID_SAVINGS', cash);
      !savings ? markInvalid('liquidAssets.savingbalance') : addItem('LIQUID_SAVINGS', savings);
    }

    //  PROPERTY (FormArray)
    if (this.selectedAssets.includes('PROPERTY')) {
      const arr = this.assetsForm.get('properties') as FormArray;

      arr.controls.forEach((ctrl: any) => {
        if (ctrl.invalid) {
          ctrl.markAllAsTouched();
          invalid = true;
        } else {
          addItem('PROPERTY', ctrl.value.marketval, {
            propertyType: ctrl.value.propertytype,
            ownershipType: ctrl.value.ownershiptype,
            location: ctrl.value.location
          });
        }
      });
    }

    //  FIXED DEPOSIT (FormArray)
    if (this.selectedAssets.includes('FIXED_DEPOSIT')) {
      const arr = this.assetsForm.get('fixedDeposits') as FormArray;

      arr.controls.forEach((ctrl: any) => {
        if (ctrl.invalid) {
          ctrl.markAllAsTouched();
          invalid = true;
        } else {
          addItem('FIXED_DEPOSIT', ctrl.value.bankamt, {
            bankName: ctrl.value.bankname,
            maturityDate: (ctrl.value.maturitydate).format('YYYY-MM-DD')
          });
        }
      });
    }

    //  INVESTMENTS
    if (this.selectedAssets.includes('INVESTMENTS')) {
      const stock = form.investments?.stockvalue;
      const mf = form.investments?.mutualfundvalue;

      stock && addItem('STOCKS', stock);
      mf && addItem('MUTUAL_FUNDS', mf);
    }

    //  Other Assets
    if (this.selectedAssets.includes('OTHER')) {
      const arr = this.assetsForm.get('otherassets') as FormArray;

      arr.controls.forEach((ctrl: any) => {
        if (ctrl.invalid) {
          ctrl.markAllAsTouched();
          invalid = true;
        } else {
          addItem('OTHER_ASSETS', ctrl.value.assetamt, {
            assetType: ctrl.value.assettype,


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
          this.formSvc.aseetsInfoData = payload
          this.patchAssetsData();
          this.stepperService.next();
        }
      }
    });

  }
}