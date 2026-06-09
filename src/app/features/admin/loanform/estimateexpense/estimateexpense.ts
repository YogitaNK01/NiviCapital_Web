import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { groupBy } from 'rxjs';

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
    { title: 'Education Fees   ', alwaysOpen: true },
    { title: 'Living Expense ', alwaysOpen: false },
    { title: 'Miscellaneous ', alwaysOpen: false },
  ];
  expenseForm!: FormGroup

  totalINRamt: any;
  totalAUDamt: any;

  totalLivingINR = 0;
  totalMiscINR = 0;

  selectedCategories: string[] = [];
  selectedmisCategories: string[] = [];


  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  allcatagory = "Select from dropdown"
  placeholderval = "Select from dropdown"
  placeholderfrequcyval = ""
  labelval = "Select Categories"
  selectedOption: string = '';

  livCatagories: OptionItem[] = [];
  misCatagories: OptionItem[] = [];


  frequencylabelval = "Select Frequency"
  searchfrequencyOptions: DropdownOption[] = [
    { label: 'Weekly', value: 'Weekly', icon: '' },
    { label: 'Monthly', value: 'Monthly', icon: '' },
    { label: 'Yearly', value: 'Yearly', icon: '' },
  ]

  searchby: string = 'Select by';
  searchedvalue: any;

  applicantId: any;
  applicationId: any
  amterror: boolean = false
  amtlimit: boolean = false;
  amountErrors: { [key: string]: boolean } = {};

  isCoApplicant: boolean = false;

  livingLoaded = false;
  miscLoaded = false;
  pendingSavedExpense: any = null;
  lastSavedPayload: any = null;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private msgBox: Msgboxservice) { }

  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');
    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );

    let Allids = this.stepperService.getLoanId();
    this.applicantId = Allids[0];
    this.applicationId = Allids[1];


    let AllCoapp_ids = this.stepperService.getCo_appId();

    if (
      this.isCoApplicant &&
      (!AllCoapp_ids || !AllCoapp_ids[0] || !AllCoapp_ids[1])
    ) {

      const storedCoApp = sessionStorage.getItem('coAppIds');
      if (storedCoApp) {
        const parsed = JSON.parse(storedCoApp);

        AllCoapp_ids = [
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName
        ];

        // restore back into service
        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
       undefined,this.stepperService.getCurrentCoApplicantIndex());
      }
    }


    // this.applicantId = this.isCoApplicant ? AllCoapp_ids[0] : Allids[0];
    if (this.isCoApplicant) {
      this.applicantId = AllCoapp_ids?.[0];
      this.applicationId = AllCoapp_ids?.[1];
    } else {
      this.applicantId = Allids?.[0];
      this.applicationId = Allids?.[1];
    }
    this.stepperService.rebuildSteps();


    const currentUserKey = 'currentApplicantId';
    const previousId = localStorage.getItem(currentUserKey);

    if (previousId && previousId !== this.applicantId) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_')) {
          localStorage.removeItem(key);
        }
      });
    }

    localStorage.setItem(currentUserKey, this.applicantId);
    this.stepperService.rebuildSteps();

    this.expenseForm = this.fb.group({

      tutionfees: ['', [Validators.required]],
      tutionfeesAUD: [{ value: '', disabled: true }, Validators.required],
      livingexpenses: this.fb.array([]),
      miscexpenses: this.fb.array([])
    })

    this.livingexp();
    this.miscgexp();



    this.expenseForm.get('tutionfees')?.valueChanges.subscribe(() => {
      this.calculateINRtoAUD();
      this.calculateGrandTotal();
    });

    this.expenseForm.get('tutionfeesAUD')?.valueChanges.subscribe(() => {
      this.calculateINRtoAUD();
    });

    this.expenseForm.get('livingexpenses')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();

    });

    this.expenseForm.get('miscexpenses')?.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });

if (this.loanformservice.isEditFlow()) {
      setTimeout(() => {
        this.patchFromSummary();
      }, 300);
    } else {
    const key = this.getStorageKey();

    const localData = localStorage.getItem(key);
    let parsedLocal = localData ? JSON.parse(localData) : null;

    //  call API
    const apiData = await this.getSavedEstExpense();

    //  PRIORITY LOGIC
    let finalData = null;

    if (apiData) {
      finalData = apiData;
      localStorage.setItem(key, JSON.stringify(apiData));
    }
    else if (parsedLocal) {
      finalData = parsedLocal;
    }


    if (finalData) {
      this.loanformservice.estExpenseInfoData = finalData;
      this.pendingSavedExpense = finalData;
      this.tryPatchSavedExpense();
    } else {
      this.lastSavedPayload = null;
    }


  }


  }

  getStorageKey() {
    return this.isCoApplicant
      ? `estimateExpenseData_coapp_${this.applicantId}`
      : `estimateExpenseData_main_${this.applicantId}`;
  }
  get f() {
    return this.expenseForm.controls;
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
    if (cleanINR == 0) { this.expenseForm.patchValue({ tutionfeesAUD: 0 }); return; }
    if (!cleanINR) return;

    const tutionfeesAUDValueonly = cleanINR / 62.5;
    const tutionfeesAUDValue = this.formatAustralian(tutionfeesAUDValueonly);

    this.expenseForm.patchValue(
      { tutionfeesAUD: tutionfeesAUDValue },
      { emitEvent: false },
    );
    this.expenseForm.get('tutionfeesAUD')?.disable();
  }

  livingexp() {
    this.loanformservice.getlivingexp().subscribe((res: any) => {
      const list = res.data ?? res;

      this.livCatagories = list.map((s: any) => ({
        value: s.id,
        label: s.name,
        code: s.code
      }));

      if (this.loanformservice.estExpenseInfoData) {
        this.patchExpenseData()
      }

      this.livingLoaded = true;
      this.tryPatchSavedExpense();

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
      if (this.loanformservice.estExpenseInfoData) {
        this.patchExpenseData()
      }

      this.miscLoaded = true;
      this.tryPatchSavedExpense();

    });
  }


  isExpenseValid(): boolean {

    const tuitionINR = this.expenseForm.get('tutionfees')?.value;
    const tuitionAUD = this.expenseForm.get('tutionfeesAUD')?.value;

    const isTuitionINRValid = tuitionINR != null && tuitionINR !== '' && !isNaN(Number(tuitionINR));
    const isTuitionAUDValid = tuitionAUD != null && tuitionAUD !== '' && !isNaN(Number(tuitionAUD));

    return tuitionINR;
  }

  // =======================================================================================================
  get livingexpenses(): FormArray {
    return this.expenseForm.get('livingexpenses') as FormArray;
  }

  createExpense(category: string): FormGroup {
    const group = this.fb.group({
      category: [category],
      categoryLabel: [this.getCategoryLabel(category)],
      securityfrequency: ['Monthly', Validators.required],
      amountINR: ['', Validators.required],
      amountAUD: [{ value: '', disabled: true }, Validators.required],
      description: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    });
    group.get('amountINR')?.valueChanges.subscribe((val) => {

      console.log("val", val)
      if (!val) { group.patchValue({ amountAUD: '' }); return; }
      const cleanINR = Number(val.toString().replace(/,/g, ''));
      console.log("cleanINR", cleanINR)

      if (!cleanINR) return;

      const aud = cleanINR / 62.5;

      group.patchValue(
        { amountAUD: this.formatAustralian(aud) },
        { emitEvent: false }
      );
      group.get('amountAUD')?.disable();

      // group.get('amountINR')?.valueChanges.subscribe(() => {
      //   this.validateAmount(group);
      // });

      // group.get('securityfrequency')?.valueChanges.subscribe(() => {
      //   this.validateAmount(group); 

      // })
    });
    const amountCtrl = group.get('amountINR');
    const frequencyCtrl = group.get('securityfrequency');

    amountCtrl?.valueChanges.subscribe(() => {
      this.validateAmount(group);
    });

    frequencyCtrl?.valueChanges.subscribe(() => {
      this.validateAmount(group);
    });
    ``

    return group;

  }

  addCategoryExpense(category: string) {
    this.livingexpenses.push(this.createExpense(category));
  }

  addmore(category: string) {
    const index = this.livingexpenses.controls
      .map((g: any) => g.get('category')?.value)
      .lastIndexOf(category);

    const newGroup = this.createExpense(category);
    this.livingexpenses.insert(index + 1, newGroup);

    // this.livingexpenses.insert(index + 1, this.createExpense(category));
    // setTimeout(() => this.updateView());

  }
  oncatagoryChange(values: string | string[]): void {

    this.selectedCategories = Array.isArray(values) ? values : [values];

    console.log("check val", this.selectedCategories)

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
      categoryLabel: [this.getmisCategoryLabel(category)],
      securityfrequency: ['Monthly', Validators.required],
      amountINR: ['', Validators.required],
      amountAUD: [{ value: '', disabled: true }, Validators.required],
      descriptionmisc: ['', [Validators.minLength(2), Validators.maxLength(50)]]
    });

    group.get('amountINR')?.valueChanges.subscribe((val) => {

      if (!val) return;

      const cleanINR = Number(val.toString().replace(/,/g, ''));

      if (!cleanINR) return;

      const aud = cleanINR / 62.5;

      group.patchValue(
        { amountAUD: this.formatAustralian(aud) },
        { emitEvent: false }
      );
      group.get('amountAUD')?.disable();

      group.get('amountINR')?.valueChanges.subscribe(() => {
        this.validateAmount(group);
      });

      group.get('securityfrequency')?.valueChanges.subscribe(() => {
        this.validateAmount(group);
      });

    });


    return group;
  }

  addmiscCategoryExpense(category: string) {
    this.miscexpenses.push(this.createmiscExpense(category));
  }

  miscaddmore(category: string) {
    const index = this.miscexpenses.controls
      .map((g: any) => g.get('category')?.value)
      .lastIndexOf(category);

    this.miscexpenses.insert(index + 1, this.createmiscExpense(category));

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
  calculateGrandTotal() {

    const tuition = Number(this.expenseForm.get('tutionfees')?.value?.toString().replace(/,/g, '')) || 0;

    this.totalLivingINR = this.calculateTotal('livingexpenses');
    this.totalMiscINR = this.calculateTotal('miscexpenses');

    this.totalINRamt = tuition + this.totalLivingINR + this.totalMiscINR;
    let totalInramount = this.totalINRamt
    this.totalINRamt = this.formatIndian(this.totalINRamt.toString());


    this.totalAUDamt = totalInramount / 62.5;
    this.totalAUDamt = this.formatAustralian(this.totalAUDamt.toString());
  }
  calculateTotal(formArrayName: string): number {

    let total = 0;

    const formArray = this.expenseForm.get(formArrayName) as any;

    formArray.controls.forEach((grp: any) => {
      const val = grp.get('amountINR')?.value;

      if (val) {
        const clean = Number(val.toString().replace(/,/g, ''));
        total += clean;
      }
    });

    return total;
  }

  getAccordionTotal(index: number): string {
    switch (index) {

      case 0: // Education Fees
        const tuition = Number(
          this.expenseForm.get('tutionfees')?.value?.toString().replace(/,/g, '')
        ) || 0;
        return this.formatIndian(tuition.toString());

      case 1: // Living Expense
        return this.formatIndian(this.totalLivingINR.toString());

      case 2: // Miscellaneous
        return this.formatIndian(this.totalMiscINR.toString());

      default:
        return '0';
    }
  }

  handleAmountInput1(event: any, controlName: string) {
    this.main.restrictInput(event, 'decimal');
    this.formatAmount(event, controlName);
  }

  handleAmountInput(event: any, controlName: string, ctrl?: any) {
    this.main.restrictInput(event, 'decimal');
    if (ctrl) {
      this.formatAmount1(event, controlName, ctrl);
    } else {
      this.formatAmount(event, controlName);
    }


  }


  //format amount 2000000 to 20,00,000
  formatAmountold(event: any, controlName: string, index?: number, type?: 'living' | 'misc') {

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

    if ((controlName === 'tutionfees' && num >= 10000001) || (controlName === 'amountINR' && num >= 10000001)) {
      this.amterror = true;
    } else { this.amterror = false; }



    const formatted = this.formatIndian(num.toString());
    if (index !== undefined) {
      const array = type === 'misc' ? this.miscexpenses : this.livingexpenses;

      const group = array.at(index) as FormGroup;
      group.get(controlName)?.setValue(formatted, { emitEvent: false });

    }
    else {
      this.expenseForm.get(controlName)?.setValue(formatted, { emitEvent: false });


    }

  }


  formatAmount1(event: any, controlName: string, control: AbstractControl) {
    const group = control as FormGroup;
    let value = event.target.value;

    if (!value) return;

    value = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    const num = Number(value);

    const formatted = this.formatIndian(num.toString());
    group.get(controlName)?.setValue(formatted, { emitEvent: false });
    this.validateAmount(group);
  }


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
    this.expenseForm.get(controlName)?.setValue(formatted, { emitEvent: false });


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
      this.expenseForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }

  }

  validateAmount(group: FormGroup) {
    const amountStr = group.get('amountINR')?.value;  // "50,00,000"
    const frequency = group.get('securityfrequency')?.value || 'Monthly';

    const cleanINR = Number(amountStr.toString().replace(/,/g, ''));  // 5000000

    const limits = {
      'Weekly': 100000,     // → "1,00,000"
      'Monthly': 5000000,   // → "50,00,000" 
      'Yearly': 10000000    // → "1,00,00,000"
    };

    const exceedsLimit = cleanINR > limits[frequency as keyof typeof limits];

    group.get('amountINR')?.setErrors(exceedsLimit ? { exceedsLimit: true } : null);
  }
  getFormattedLimit(frequency: string): string {
    const limits = {
      'Weekly': 100000,
      'Monthly': 5000000,
      'Yearly': 10000000
    };
    const limit = limits[frequency as keyof typeof limits] || 5000000;
    return this.formatIndian(limit.toString());
  }

  getFrequencyLabel(frequency: string): string {
    return frequency || 'Monthly';
  }

  formatIndian(x: string): string {
    return new Intl.NumberFormat('en-IN').format(Number(x));
  }
  formatAustralian(x: number): string {
    return new Intl.NumberFormat('en-AU').format(x);
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

  removeexpense(index: number, type: 'living' | 'misc') {

    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {



        if (type === 'living') {

          const livingArray = this.livingexpenses;
          livingArray.removeAt(index);

          // const categoryToRemove = livingArray.at(index).get('category')?.value;

          // for (let i = livingArray.length - 1; i >= 0; i--) {
          //   if (livingArray.at(i).get('category')?.value === categoryToRemove) {
          //     livingArray.removeAt(i);
          //   }
          // }

          const livcategories = livingArray.controls.map(
            ctrl => ctrl.get('category')?.value
          );
          this.selectedCategories = [...new Set(livcategories)];
        }

        else {

          const miscArray = this.miscexpenses;
          miscArray.removeAt(index);

          // const categoryToRemove = miscArray.at(index).get('category')?.value;

          // for (let i = miscArray.length - 1; i >= 0; i--) {
          //   if (miscArray.at(i).get('category')?.value === categoryToRemove) {
          //     miscArray.removeAt(i);
          //   }
          // }

          const miscategories = miscArray.controls.map(
            ctrl => ctrl.get('category')?.value
          );

          this.selectedmisCategories = [...new Set(miscategories)];
        }

      }
    });
  }

  patchExpenseData() {
    const data = this.loanformservice.estExpenseInfoData;

    if (!data) return;

    this.expenseForm.patchValue({
      tutionfees: this.formatIndian(data.tuitionFeesInr),
      tutionfeesAUD: this.formatAustralian(data.tuitionFeesInr / 62.5)

    });

    this.livingexpenses.clear();
    this.miscexpenses.clear();

    this.selectedCategories = [];
    this.selectedmisCategories = [];

    data.items.forEach((item: any) => {

      //  Living
      if (item.livingExpenseItemMasterId) {

        const group = this.createExpense(item.livingExpenseItemMasterId);

        group.patchValue({
          securityfrequency: this.capitalize(item.frequency),
          amountINR: this.formatIndian(item.amountInr),
          description: item.description
        });

        this.livingexpenses.push(group);

        // maintain selected categories
        if (!this.selectedCategories.includes(item.livingExpenseItemMasterId)) {
          this.selectedCategories.push(item.livingExpenseItemMasterId);
        }
      }

      //  Misc
      if (item.miscellaneousExpenseItemMasterId) {

        const group = this.createmiscExpense(item.miscellaneousExpenseItemMasterId);

        group.patchValue({
          securityfrequency: this.capitalize(item.frequency),
          amountINR: this.formatIndian(item.amountInr),
          descriptionmisc: item.description
        });

        this.miscexpenses.push(group);

        if (!this.selectedmisCategories.includes(item.miscellaneousExpenseItemMasterId)) {
          this.selectedmisCategories.push(item.miscellaneousExpenseItemMasterId);
        }
      }

    });

    this.selectedCategories = [...new Set(this.selectedCategories)];
    this.selectedmisCategories = [...new Set(this.selectedmisCategories)];

    this.calculateINRtoAUD();
    this.calculateGrandTotal();
    this.cd.detectChanges();
  }
  capitalize(val: string): string {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  }
//edit floe patch from summary
patchFromSummary() {
  if (!this.loanformservice.isEditFlow()) return;

  const data = this.loanformservice.getSummarySection('estimatedExpense');
  console.log('patch estimated expense', data);

  if (!data) return;

  const items: any[] = [];

  // Living Expenses
  (data.livingExpenses || []).forEach((item: any) => {
    const categoryId =
      item.livingExpenseItemMasterId ||
      item.categoryId ||
      item.id ||
      this.livCatagories.find(c =>
        c.label?.toLowerCase() ===
        (item.name || item.category || item.expenseName || '').toLowerCase()
      )?.value;

    if (categoryId) {
      items.push({
        livingExpenseItemMasterId: categoryId,
        frequency: item.frequency || 'MONTHLY',
        amountInr: Number(item.amountInr || item.amount || 0),
        description: item.description || ''
      });
    }
  });

  // Miscellaneous Expenses
  (data.miscellaneousExpenses || []).forEach((item: any) => {
    const categoryId =
      item.miscellaneousExpenseItemMasterId ||
      item.categoryId ||
      item.id ||
      this.misCatagories.find(c =>
        c.label?.toLowerCase() ===
        (item.name || item.category || item.expenseName || '').toLowerCase()
      )?.value;

    if (categoryId) {
      items.push({
        miscellaneousExpenseItemMasterId: categoryId,
        frequency: item.frequency || 'MONTHLY',
        amountInr: Number(item.amountInr || item.amount || 0),
        description: item.description || ''
      });
    }
  });

  const tuitionFeesInr =
    typeof data.educationFees === 'number'
      ? data.educationFees
      : data.educationFees?.amountInr ||
        data.educationFees?.tuitionFeesInr ||
        data.tuitionFeesInr ||
        0;

  const mappedData = {
    tuitionFeesInr: Number(tuitionFeesInr || 0),
    items: items
  };

  this.loanformservice.estExpenseInfoData = mappedData;

  this.patchSavedEstExpense(mappedData);

  this.lastSavedPayload = this.buildExpensePayload();
}
  tryPatchSavedExpense() {
    if (!this.pendingSavedExpense) return;
    if (!this.livingLoaded || !this.miscLoaded) return;

    this.patchSavedEstExpense(this.pendingSavedExpense);

    // optional snapshot for “changed or not” logic
    this.lastSavedPayload = this.buildExpensePayload();

    this.pendingSavedExpense = null;
  }

  patchSavedEstExpense(data: any) {
    if (!data) return;

    this.expenseForm.patchValue({
      tutionfees: this.formatIndian(String(data.tuitionFeesInr || 0)),
      tutionfeesAUD: this.formatAustralian((data.tuitionFeesInr || 0) / 62.5)
    }, { emitEvent: false });

    this.livingexpenses.clear();
    this.miscexpenses.clear();

    this.selectedCategories = [];
    this.selectedmisCategories = [];

    (data.items || []).forEach((item: any) => {
      // Living Expense
      if (item.livingExpenseItemMasterId) {
        const group = this.createExpense(item.livingExpenseItemMasterId);

        group.patchValue({
          category: item.livingExpenseItemMasterId,
          categoryLabel: this.getCategoryLabel(item.livingExpenseItemMasterId),
          securityfrequency: this.capitalize(item.frequency || 'MONTHLY'),
          amountINR: this.formatIndian(String(item.amountInr || 0)),
          amountAUD: this.formatAustralian((item.amountInr || 0) / 62.5),
          description: item.description || ''
        }, { emitEvent: false });

        this.livingexpenses.push(group);

        if (!this.selectedCategories.includes(item.livingExpenseItemMasterId)) {
          this.selectedCategories.push(item.livingExpenseItemMasterId);
        }
      }

      // Misc Expense
      if (item.miscellaneousExpenseItemMasterId) {
        const group = this.createmiscExpense(item.miscellaneousExpenseItemMasterId);

        group.patchValue({
          category: item.miscellaneousExpenseItemMasterId,
          categoryLabel: this.getmisCategoryLabel(item.miscellaneousExpenseItemMasterId),
          securityfrequency: this.capitalize(item.frequency || 'MONTHLY'),
          amountINR: this.formatIndian(String(item.amountInr || 0)),
          amountAUD: this.formatAustralian((item.amountInr || 0) / 62.5),
          descriptionmisc: item.description || ''
        }, { emitEvent: false });

        this.miscexpenses.push(group);

        if (!this.selectedmisCategories.includes(item.miscellaneousExpenseItemMasterId)) {
          this.selectedmisCategories.push(item.miscellaneousExpenseItemMasterId);
        }
      }
    });

    this.selectedCategories = [...new Set(this.selectedCategories)];
    this.selectedmisCategories = [...new Set(this.selectedmisCategories)];

    this.calculateINRtoAUD();
    this.calculateGrandTotal();
    this.cd.detectChanges();
  }

  buildExpensePayload() {
    const formdata = this.expenseForm.getRawValue();

    const livingExpenses = formdata.livingexpenses.map((item: any) => ({
      livingExpenseItemMasterId: item.category,
      frequency: item.securityfrequency?.toUpperCase(),
      amountInr: Number(String(item.amountINR || '').replace(/,/g, '')),
      description: item.description || ''
    }));

    const miscExpenses = formdata.miscexpenses.map((item: any) => ({
      miscellaneousExpenseItemMasterId: item.category,
      frequency: item.securityfrequency?.toUpperCase(),
      amountInr: Number(String(item.amountINR || '').replace(/,/g, '')),
      description: item.descriptionmisc || ''
    }));

    return {
      applicantId: this.applicantId,
      tuitionFeesInr: Number(String(formdata.tutionfees || '').replace(/,/g, '')),
      items: [...livingExpenses, ...miscExpenses]
    };
  }

  //save and exit 
  saveExit() {
    let formdata = this.expenseForm.value
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


    let input = {
      tuitionFeesInr: Number(formdata.tutionfees.replace(/,/g, '')),
      items: [...livingExpenses, ...miscExpenses]
    }

    const inputdata = {
      action: "auto-save",
      sectionKey: "ESTIMATED_EXPENSE",
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      jsonData: input
    };

    this.loanformservice.saveandExit(inputdata).subscribe();
  }
  //get api for saved data
  getSavedEstExpense(): Promise<any> {
    let sectionkey = "ESTIMATED_EXPENSE"
    return new Promise((resolve) => {
      this.loanformservice.getSavedData(this.applicationId, this.applicantId, sectionkey).pipe()

        .subscribe({
          next: (res) => {

            console.log(res)
            if (res.status === "success") {
              resolve(res.data.data);

            }
            else {
              resolve(null);
            }
          }, error: () => resolve(null)
        });
    });
  }
  back() {
    this.stepperService.previous();
  }



  next() {

    // alert(this.expenseForm.get('tutionfees')?.value)
    const livingArray = this.expenseForm.get('livingexpenses') as FormArray;
    const miscArray = this.expenseForm.get('miscexpenses') as FormArray;
    const tutionfee = this.expenseForm.get('tutionfees')
    let invalid = false;
   


    livingArray.controls.forEach(control => {
      if (control.invalid) {
        control.markAllAsTouched();
        invalid = true;
      }
    });

    miscArray.controls.forEach(control => {
      if (control.invalid) {
        control.markAllAsTouched();
        invalid = true;
      }
    });



    if (invalid || this.amterror || !tutionfee?.value || tutionfee.value < 0) {
      console.log("Form is invalid or tuition fee is missing/negative");
      return;
    }

    let formdata = this.expenseForm.value
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


    let input = {
      applicantId: this.applicantId,
      tuitionFeesInr: Number(formdata.tutionfees.replace(/,/g, '')),
      items: [...livingExpenses, ...miscExpenses]
    }

    this.loanformservice.estimateExpense(input, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {
          this.loanformservice.estExpenseInfoData = input;
          const key = `estimateExpenseData_main_${this.applicantId}`;
          localStorage.setItem(key, JSON.stringify(this.loanformservice.estExpenseInfoData));
          this.stepperService.markStepCompleted('expense');
          this.stepperService.setStepData('expense', formdata);
          this.stepperService.next();
        }
      }
    });


  }

}
