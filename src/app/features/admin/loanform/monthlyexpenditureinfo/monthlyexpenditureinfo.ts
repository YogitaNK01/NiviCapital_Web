import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { debounceTime } from 'rxjs/operators';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { firstValueFrom } from 'rxjs';
import { Storage } from '../../../../core/service/storage';
@Component({
  selector: 'app-monthlyexpenditureinfo',
  imports: [CommonModule, ReactiveFormsModule, Buttons, Dropdown, Inputfield],
  standalone: true,
  templateUrl: './monthlyexpenditureinfo.html',
  styleUrl: './monthlyexpenditureinfo.scss'
})
export class Monthlyexpenditureinfo {

  applicantId: any;
  applicationId: any;

  openIndex: number[] = [0];
  accordions = [
    { title: 'Rent/ Home Maintenance ', alwaysOpen: true, key: 'RentHomeMaintenance' },
    { title: 'Groceries and Household ', alwaysOpen: true, key: 'GroceriesandHousehold' },
    { title: 'Utilities (Electricity, Water, Gas)', alwaysOpen: true, key: 'Utilities' },
    { title: 'Transportation', alwaysOpen: true, key: 'Transportation' },
    { title: 'School Education Fees ', alwaysOpen: true, key: 'SchoolEducationFees' },
    { title: 'Medical/ Medicines', alwaysOpen: true, key: 'Medical' },
    { title: 'Other Recurring Expenses', alwaysOpen: true, key: 'Others' },
  ];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';
  monthlyExpenditure: DropdownOption[] = [
    { label: 'Rent/ Home Maintenance', value: 'RentHomeMaintenance', icon: '' },
    { label: 'Groceries and Household', value: 'GroceriesandHousehold', icon: '' },
    { label: 'Utilities (Electricity, Water, Gas)', value: 'Utilities', icon: '' },
    { label: 'Transportation', value: 'Transportation', icon: '' },
    { label: 'School Education Fees', value: 'SchoolEducationFees', icon: '' },
    { label: 'Medical/ Medicines', value: 'Medical', icon: '' },
    { label: 'Others', value: 'Others', icon: '' },
  ];
  selectedexpenditure: string[] = [];

  monthlyExpenditureForm!: FormGroup;

  CodeMap: { [key: string]: string } = {};

  fieldMap: any = {
    RentHomeMaintenance: {
      form: 'rent',
      api: 'RENT_HOME_MAINTENANCE'
    },
    GroceriesandHousehold: {
      form: 'grocery',
      api: 'GROCERIES_HOUSEHOLD'
    },
    Utilities: {
      form: 'utilities',
      api: 'UTILITIES'
    },
    Transportation: {
      form: 'transportation',
      api: 'TRANSPORTATION'
    },
    SchoolEducationFees: {
      form: 'SchoolFees',
      api: 'SCHOOL_EDUCATION_FEES'
    },
    Medical: {
      form: 'MedicalMedicines',
      api: 'MEDICAL_MEDICINES'
    },
    Others: {
      form: 'other',
      api: 'OTHER_RECURRING'
    }
  };
  selectedexpense: string[] = [];
  otherExpenses: DropdownOption[] = [
    { label: 'Subscriptions', value: 'Subscriptions', icon: '' },
    { label: 'Lifestyle', value: 'Lifestyle', icon: '' },
    { label: 'Entertainment', value: 'Entertainment', icon: '' },
    { label: 'Insurance Premium', value: 'Insurance Premium', icon: '' },
    { label: 'Other', value: 'Other', icon: '' },
  ];
  totalrent = 0;
  totalgrocery = 0;
  totaltransportation = 0;
  totalother = 0;
  totalINRamt: any;

  isCoApplicant: boolean = false;
  lastSavedPayload: any = null;
    isSummaryEditMode = false;
  viewOnly = false;

    //edit from summary
  isFromSummary = false;
  isViewMode = false;
  isEditMode = false;
  originalFormValue: any = null;


  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private msgBox: Msgboxservice, private router: Router,private storageservice:Storage,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');
    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );
    if (this.isCoApplicant) {
  this.stepperService.restoreCoAppIdFromSession();
}

this.stepperService.restoreLoanEditContext();
this.stepperService.restoreLoanIdFromSession();

    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    // this.custName = Allids[2];
    // this.custARN = Allids[3];

    let AllCoapp_ids = this.stepperService.getCo_appId();

const queryParams = this.route.snapshot.queryParams;

    this.isSummaryEditMode =
      queryParams['fromSummary'] === true ||
      queryParams['fromSummary'] === 'true' ||
      this.formSvc.isSummaryEditFlow();

    this.viewOnly = this.isSummaryEditMode && (queryParams['mode'] === 'view' || queryParams['mode'] === undefined);

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
        this.stepperService.setCurrentCoApplicantIndex(parsed.coApplicantIndex || 1);
        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
        undefined,parsed.coApplicantIndex || 1);
      }
    }
    if (this.isCoApplicant) {
      this.applicantId = AllCoapp_ids?.[0];
      this.applicationId = AllCoapp_ids?.[1];
    } else {
      this.applicantId = Allids?.[0];
      this.applicationId = Allids?.[1];
    }
    this.stepperService.rebuildSteps();


    this.monthlyExpenditureForm = this.fb.group({
      rent: this.fb.group({
        rentvalue: ['', Validators.required]
      }),
      grocery: this.fb.group({
        groceryvalue: ['', Validators.required]
      }),
      utilities: this.fb.group({
        utilityvalue1: ['', Validators.required],
        utilityvalue2: ['', Validators.required]
      }),
      transportation: this.fb.group({
        transportationvalue: ['', Validators.required]
      }),
      SchoolFees: this.fb.group({
        SchoolFeesvalue: ['', Validators.required]
      }),
      MedicalMedicines: this.fb.group({
        MedicalMedicinesvalue: ['', Validators.required]
      }),
      other: this.fb.array([this.createOther()]),

    });




    this.monthlyExpenditureForm.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.calculateGrandTotal();
      });
if (this.viewOnly) {
  this.monthlyExpenditureForm.disable({ emitEvent: false });
}

await this.loadMonthlyExpenditureForBothFlows();

  this.isFromSummary = this.formSvc.isSummaryEditFlow();

    if(this.isFromSummary){
      this.isViewMode = true;
      this.monthlyExpenditureForm.disable();
    }


  }

  getStorageKey1() {
     const index = this.stepperService.getCurrentCoApplicantIndex();
         const coApplicantId = this.stepperService.getCo_appId()?.[0];
   return this.isCoApplicant
      ? `monthlyExpenditureData_coapp_${this.applicationId}_${index}`
      : `monthlyExpenditureData_main_${this.applicationId}_${this.stepperService.getLoanId()?.[0]}`;
  }
    getStorageKey() {
    const main_ApplicantId = this.stepperService.getLoanId()?.[0];
    const co_ApplicantId = this.stepperService.getCo_appId()?.[0];
    const index = this.stepperService.getCurrentCoApplicantIndex();

    return this.storageservice.getStorageKey(
      'monthlyExpenditureData',
      this.applicationId,
      this.applicantId,
      this.isCoApplicant,
    
    );
  }

    getCurrentCoApplicantFromList() {
    const mainApplicantId = this.stepperService.getLoanId()?.[0];
    const index = this.stepperService.getCurrentCoApplicantIndex();

    const saved = localStorage.getItem(`coApplicants_${mainApplicantId}`);
    const list = saved ? JSON.parse(saved) : [];

    return list.find((x: any) => Number(x.index) === Number(index));
  }

  getApiApplicantId() {
    if (!this.isCoApplicant) {
      return this.stepperService.getLoanId()?.[0];
    }

    return this.stepperService.getCo_appId()?.[0] || null;
  }
private async getSummarySection(sectionKey: string): Promise<any> {
  if (!this.applicationId) return null;

  try {
    const res: any = await firstValueFrom(
      this.formSvc.getSummary(this.applicationId)
    );

    if (!res || res.status !== 'success') return null;

    return this.formSvc.getApplicantSectionFromSummary(
      res,
      sectionKey,
      {
        isCoApplicant: this.isCoApplicant,
        coApplicantId: this.stepperService.getCo_appId()?.[0],
        coApplicantIndex: this.stepperService.getCurrentCoApplicantIndex()
      }
    );
  } catch (error) {
    console.error(`Failed to get summary section: ${sectionKey}`, error);
    return null;
  }
}

private async loadMonthlyExpenditureForBothFlows() {
  const key = this.getStorageKey();

  // const localData = localStorage.getItem(key);
  // const parsedLocal = localData ? JSON.parse(localData) : null;

   const parsedLocal = this.storageservice.getStoredSectionData(
      'monthlyExpenditureData',
      this.applicationId,
      this.applicantId,
      this.isCoApplicant
    );

  const applicantId = this.getApiApplicantId();

  const draftData = applicantId
    ? await this.getSavedMonthlyExp(applicantId)
    : null;

  const summarySection = await this.getSummarySection('monthlyExpenditure');

  
const normalizedSummary = this.normalizeMonthlyExpenditure(summarySection);
  const normalizedDraft = this.normalizeMonthlyExpenditure(draftData);
  const normalizedLocal = this.normalizeMonthlyExpenditure(parsedLocal);

  let finalData: any = null;

  const summaryComplete =
    normalizedSummary &&
    this.isMonthlyExpPayloadComplete(normalizedSummary);

  if (summaryComplete) {
    finalData = normalizedSummary;
  } else if (normalizedDraft?.items?.length) {
    finalData = normalizedDraft;
  } else if (normalizedLocal?.items?.length) {
    finalData = normalizedLocal;
  } else if (normalizedSummary?.items?.length) {
    finalData = normalizedSummary;
  }

  if (!finalData) {
    this.lastSavedPayload = null;
    this.selectedexpenditure = [];
    this.openIndex = [];

    this.monthlyExpenditureForm.reset({
      rent: { rentvalue: '' },
      grocery: { groceryvalue: '' },
      utilities: { utilityvalue1: '', utilityvalue2: '' },
      transportation: { transportationvalue: '' },
      SchoolFees: { SchoolFeesvalue: '' },
      MedicalMedicines: { MedicalMedicinesvalue: '' }
    }, { emitEvent: false });

    this.monthlyExpenditureForm.setControl('other', this.fb.array([this.createOther()]));
    this.calculateGrandTotal();
    this.cd.detectChanges();
    return;
  }


  if (this.isCoApplicant) {
    this.formSvc.co_monthlyExpenditureData = finalData;
  } else {
    this.formSvc.monthlyExpenditureData = finalData;
  }

  this.patchMonthlyExpenditure();

  const snapshot = this.buildMonthlyExpPayloadWithApplicantId();

  this.lastSavedPayload = snapshot.invalid
    ? null
    : {
        applicantId: snapshot.applicantId,
        items: snapshot.items
      };

  // localStorage.setItem(key, JSON.stringify(finalData));
    this.storageservice.saveSectionData(
            'monthlyExpenditureData',
            this.applicationId,
            this.applicantId,
            this.isCoApplicant,
            JSON.stringify(finalData)
          );

  this.calculateGrandTotal();
  this.stepperService.markStepCompleted(this.getStepRoute());
  this.cd.detectChanges();
}
private isMonthlyExpPayloadComplete(data: any): boolean {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    return false;
  }

  const groupedTypes = data.items.map((x: any) => x.expenseType);

  // If a category exists in data, required fields for that category must be present
  for (const item of data.items) {
    if (!item.expenseType) return false;

    if (
      item.expenseType === 'RENT_HOME_MAINTENANCE' ||
      item.expenseType === 'GROCERIES_HOUSEHOLD' ||
      item.expenseType === 'TRANSPORTATION' ||
      item.expenseType === 'SCHOOL_EDUCATION_FEES' ||
      item.expenseType === 'MEDICAL_MEDICINES'
    ) {
      if (!item.amountInr) return false;
    }

    if (item.expenseType === 'TELEPHONE' || item.expenseType === 'UTILITIES') {
      if (!item.amountInr) return false;
    }

    if (item.expenseType === 'OTHER_RECURRING') {
      if (!item.amountInr || !item.expenseTypeText) return false;
    }
  }

  return true;
}

private normalizeMonthlyExpenditure(data: any): any {
  if (!data) return null;

  // Already draft/local payload
  if (Array.isArray(data.items)) {
    return {
      applicantId: data.applicantId || this.getApiApplicantId(),
      items: data.items
    };
  }

  const items: any[] = [];

  const addItem = (
    expenseType: string,
    amount: any,
    extra: any = {}
  ) => {
    if (amount === null || amount === undefined || amount === '') return;

    items.push({
      expenseType,
      amountInr: Number(amount || 0),
      ...extra
    });
  };

  addItem(
    'RENT_HOME_MAINTENANCE',
    data.rentHomeMaintenance?.amountInr
  );

  addItem(
    'GROCERIES_HOUSEHOLD',
    data.groceriesHousehold?.amountInr
  );
  addItem(
    'TELEPHONE',
    data.telephoneInternetBills?.amountInr
  );
  (data.utilitiesElectricityWaterGas || []).forEach((item: any) => {
    const name = item.name || '';

    const isTelephone =
      name.toLowerCase().includes('telephone') ||
      name.toLowerCase().includes('internet');

    addItem(
      isTelephone ? 'TELEPHONE' : 'UTILITIES',
      item.amountInr,
      {
        expenseTypeText: name
      }
    );
  });

  addItem(
    'TRANSPORTATION',
    data.transportation?.amountInr
  );

  addItem(
    'SCHOOL_EDUCATION_FEES',
    data.schoolEducationFees?.amountInr
  );

  addItem(
    'MEDICAL_MEDICINES',
    data.medicalMedicines?.amountInr
  );

  (data.otherRecurringExpenses || []).forEach((item: any) => {
    addItem(
      'OTHER_RECURRING',
      item.amountInr,
      {
        expenseTypeText: item.name || item.expenseTypeText || ''
      }
    );
  });

  if (!items.length) return null;

  return {
    applicantId: this.getApiApplicantId(),
    totalMonthlyInr: data.totalMonthlyInr || 0,
    items
  };
}

  get other(): FormArray {
    return this.monthlyExpenditureForm.get('other') as FormArray;
  }
  getGroupValues(group: any) {
    return Object.values(group).filter(v => v !== null && v !== '');
  }

  createOther(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      customType: [''],
      amount: ['', Validators.required]
    });
  }
  addmore() {

    this.other.push(this.createOther());

  }



  onChange(values: string | string[]): void {

    const newSelected = Array.isArray(values) ? values : [values];
    // Detect if cleared all
    const clearedAll = newSelected.length === 0;
    if (clearedAll) {
      // Clear all selections and reset form fully
      this.selectedexpenditure = [];
      this.openIndex = [];
      this.monthlyExpenditureForm.reset();



      // Clear all 'other' entries

      while (this.other.length !== 0) {
        this.other.removeAt(0);
      }

    } else {

      // Partial or full selection
      // Find deselected keys

      const deselected = this.selectedexpenditure.filter(k => !newSelected.includes(k));
      // Find newly selected keys
      const newlySelected = newSelected.filter(k => !this.selectedexpenditure.includes(k));

      this.selectedexpenditure = newSelected;
      // Update open accordions

      this.openIndex = [];
      this.selectedexpenditure.forEach(val => {
        const index = this.accordions.findIndex(a => a.key === val);
        if (index !== -1) {
          this.openIndex.push(index);
        }

      });



      // Reset form groups for deselected keys only

      deselected.forEach(key => {
        const formKey = this.fieldMap[key]?.form;
        if (!formKey) return;

        const control = this.monthlyExpenditureForm.get(formKey);
        if (control instanceof FormGroup) {
          control.reset();
        } else if (control instanceof FormArray) {
          if (formKey === 'other') {
            control.clear();
          } else {
            control.clear();

          }

        }

      });



      // Initialize form groups for newly selected keys

      this.selectedexpenditure.forEach(key => {

        const formKey = this.fieldMap[key]?.form;
        if (!formKey) return;
        const control = this.monthlyExpenditureForm.get(formKey);
        if (control instanceof FormGroup) {
          if (Object.values(control.value).every(v => v === '' || v === null)) {
            control.reset();

          }

        } else if (control instanceof FormArray) {
          if (formKey === 'other') {
            if (control.length === 0) {
              control.push(this.createOther());

            }
          }
        }

      });
    }

  }


  onExpenseChange(values: string | string[]): void {
    this.selectedexpense = Array.isArray(values) ? values : [values];
    this.openIndex = [];


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
    if (this.monthlyExpenditureForm.invalid) return;

    console.log(this.monthlyExpenditureForm.value);
  }


  removeAccordion(key: string, index: number, event: Event) {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {
        event.stopPropagation();

        this.selectedexpenditure = this.selectedexpenditure.filter(k => k !== key);

        this.openIndex = this.openIndex.filter(i => i !== index);

        const formKey = this.fieldMap[key]?.form;

        if (!formKey) return;

        const control = this.monthlyExpenditureForm.get(formKey);

        if (control instanceof FormGroup) {
          control.reset(
            Object.keys(control.controls).reduce((acc, k) => {

              acc[k] = '';

              return acc;

            }, {} as any)
          );

        } else if (control instanceof FormArray) {
          control.clear();

          // if (formKey === 'other') {
          //   control.push(this.createOther());

          // }
          if (formKey === 'other') {
            control.clear();
          } else {
            control.clear();

          }
        }


        this.cd.detectChanges();
      }
    });
  }

  calculateGrandTotal() {
    const rent = this.getValue('rent.rentvalue');
    const grocery = this.getValue('grocery.groceryvalue');
    const utility1 = this.getValue('utilities.utilityvalue1');
    const utility2 = this.getValue('utilities.utilityvalue2');
    const transportation = this.getValue('transportation.transportationvalue');
    const schoolFees = this.getValue('SchoolFees.SchoolFeesvalue');
    const medical = this.getValue('MedicalMedicines.MedicalMedicinesvalue');

    const otherTotal = this.calculateTotal('other', 'amount');

    const total =
      rent +
      grocery +
      utility1 +
      utility2 +
      transportation +
      schoolFees +
      medical +
      otherTotal;

    this.totalINRamt = this.formatIndian(total.toString());
  }
  getValue(path: string): number {
    const val = this.monthlyExpenditureForm.get(path)?.value;

    if (!val) return 0;

    return Number(val.toString().replace(/,/g, ''));
  }


  calculateTotal(formArrayName: string, controlName: string): number {

    let total = 0;

    const formArray = this.monthlyExpenditureForm.get(formArrayName) as FormArray;

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

    // DO NOT trim zeros here
    remaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

    return remaining + ',' + lastThree + decimalPart;
  }


  // Updated formatAmount - SAFE FOR LARGE NUMBERS
  formatAmount(event: any, controlName: string) {
    let value = event.target.value;
    if (!value) {
      this.monthlyExpenditureForm.get(controlName)?.setValue('');
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
    this.monthlyExpenditureForm.get(controlName)?.setValue(formatted, { emitEvent: false });
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
      this.monthlyExpenditureForm.get(controlName)?.setValue(formatted, { emitEvent: false });
    }
  }

 // edit flow = patch from summary
async patchFromSummary() {
  const section = await this.getSummarySection('monthlyExpenditure');
  const data = this.normalizeMonthlyExpenditure(section);

  if (!data) return;

  if (this.isCoApplicant) {
    this.formSvc.co_monthlyExpenditureData = data;
  } else {
    this.formSvc.monthlyExpenditureData = data;
  }

  this.patchMonthlyExpenditure();

  const snapshot = this.buildMonthlyExpPayloadWithApplicantId();

  this.lastSavedPayload = snapshot.invalid
    ? null
    : {
        applicantId: snapshot.applicantId,
        items: snapshot.items
      };

  this.calculateGrandTotal();
  this.cd.detectChanges();
}
  
  patchMonthlyExpenditure() {
    const data = this.isCoApplicant
      ? this.formSvc.co_monthlyExpenditureData
      : this.formSvc.monthlyExpenditureData;
    if (!data || !data.items) return;

    const items = data.items;

    this.selectedexpenditure = [];
    this.other.clear();
    this.monthlyExpenditureForm.setControl('other', this.fb.array([]));

    items.forEach((item: any) => {

      // ---------------- RENT ----------------
      if (item.expenseType === 'RENT_HOME_MAINTENANCE') {
        this.selectedexpenditure.push('RentHomeMaintenance');

        this.monthlyExpenditureForm.get('rent')?.patchValue({
          rentvalue: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- GROCERY ----------------
      if (item.expenseType === 'GROCERIES_HOUSEHOLD') {
        this.selectedexpenditure.push('GroceriesandHousehold');

        this.monthlyExpenditureForm.get('grocery')?.patchValue({
          groceryvalue: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- UTILITIES ----------------
      if (item.expenseType === 'TELEPHONE') {
        this.selectedexpenditure.push('Utilities');

        this.monthlyExpenditureForm.get('utilities')?.patchValue({
          utilityvalue1: this.formatIndian(item.amountInr.toString())
        });
      }

      if (item.expenseType === 'UTILITIES') {
        this.selectedexpenditure.push('Utilities');

        this.monthlyExpenditureForm.get('utilities')?.patchValue({
          utilityvalue2: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- TRANSPORT ----------------
      if (item.expenseType === 'TRANSPORTATION') {
        this.selectedexpenditure.push('Transportation');

        this.monthlyExpenditureForm.get('transportation')?.patchValue({
          transportationvalue: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- SCHOOL ----------------
      if (item.expenseType === 'SCHOOL_EDUCATION_FEES') {
        this.selectedexpenditure.push('SchoolEducationFees');

        this.monthlyExpenditureForm.get('SchoolFees')?.patchValue({
          SchoolFeesvalue: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- MEDICAL ----------------
      if (item.expenseType === 'MEDICAL_MEDICINES') {
        this.selectedexpenditure.push('Medical');

        this.monthlyExpenditureForm.get('MedicalMedicines')?.patchValue({
          MedicalMedicinesvalue: this.formatIndian(item.amountInr.toString())
        });
      }

      // ---------------- OTHER ----------------
      // this.monthlyExpenditureForm.setControl('other', this.fb.array([]));
      if (item.expenseType === 'OTHER_RECURRING') {
        this.selectedexpenditure.push('Others');

        const group = this.createOther();

        group.patchValue({
          // type: this.getOtherType(item.expenseTypeText),
          // customType: item.expenseTypeText,
          type: item.expenseTypeText,
          amount: this.formatIndian(item.amountInr.toString())
        });
        // this.other.clear()
        this.other.push(group);
      }
      this.calculateGrandTotal();
    });

    this.selectedexpenditure = [...new Set(this.selectedexpenditure)];

    if (this.other.length === 0) {
      this.other.push(this.createOther());
    }

    this.openIndex = [];
    this.selectedexpenditure.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
    this.calculateGrandTotal();
    this.cd.detectChanges();
  }
private finishAfterSaveOrNoChange() {
  if (this.isSummaryEditMode) {
    this.formSvc.clearSummaryEditFlow();

    this.router.navigate(['/loanform', 'summaryinfo'], {
      queryParamsHandling: 'merge'
    });

    return;
  }

  this.stepperService.next();
}
  getOtherType(val: string): string {
    const predefined = this.otherExpenses.map(o => o.value);

    return predefined.includes(val) ? val : 'Other';
  }

  get isNextDisabled(): boolean {
    const form = this.monthlyExpenditureForm.value;

    // nothing selected at all
    if (!this.selectedexpenditure?.length) {
      return true;
    }

    for (const key of this.selectedexpenditure) {
      const config = this.fieldMap[key];
      if (!config) continue;

      const groupName = config.form;
      const groupValue = form[groupName];

      // Utilities
      if (groupName === 'utilities') {
        if (groupValue?.utilityvalue1 || groupValue?.utilityvalue2) {
          return false; // enable Next
        }
      }

      // Other recurring
      else if (groupName === 'other') {
        if (
          Array.isArray(groupValue) &&
          groupValue.some((item: any) => item?.type && item?.amount)
        ) {
          return false;
        }
      }

      // Normal dropdown groups
      else {
        if (groupValue && Object.values(groupValue).some(v => !!v)) {
          return false;
        }
      }
    }

    return true;
  }
  back() {
    this.stepperService.previous();
  }

  //compare function
  isPayloadChanged(current: any, saved: any) {
    return JSON.stringify(current) !== JSON.stringify(saved);
  }

  //common payload
  buildMonthlyExpPayload(): {
    invalid: boolean;
    items: any[];
  } {

    const form = this.monthlyExpenditureForm.value;
    const items: any[] = [];
    let invalid = false;

    const cleanAmount = (val: any) =>
      val ? Number(val.toString().replace(/,/g, '')) : 0;

    const addItem = (code: string, value: any, extra: any = {}) => {
      if (!value) return;

      items.push({
        expenseType: code,
        amountInr: cleanAmount(value),
        ...extra
      });
    };

    // RENT
    if (this.selectedexpenditure.includes('RentHomeMaintenance')) {
      const val = form.rent?.rentvalue;
      if (!val) {
        this.monthlyExpenditureForm.get('rent')?.markAllAsTouched();
        invalid = true;
      } else {
        addItem('RENT_HOME_MAINTENANCE', val);
      }
    }

    // GROCERY
    if (this.selectedexpenditure.includes('GroceriesandHousehold')) {
      const val = form.grocery?.groceryvalue;
      if (!val) {
        this.monthlyExpenditureForm.get('grocery')?.markAllAsTouched();
        invalid = true;
      } else {
        addItem('GROCERIES_HOUSEHOLD', val);
      }
    }

    // UTILITIES
    if (this.selectedexpenditure.includes('Utilities')) {
      const utility1 = form.utilities?.utilityvalue1;
      const utility2 = form.utilities?.utilityvalue2;

      if (!utility1) {
        this.monthlyExpenditureForm.get('utilities.utilityvalue1')?.markAsTouched();
        invalid = true;
      } else {
        addItem('TELEPHONE', utility1, {
          expenseTypeText: 'Telephone and Internet bills'
        });
      }

      if (!utility2) {
        this.monthlyExpenditureForm.get('utilities.utilityvalue2')?.markAsTouched();
        invalid = true;
      } else {
        addItem('UTILITIES', utility2, {
          expenseTypeText: 'Utilities (Electricity, Water, Gas)'
        });
      }
    }

    // TRANSPORTATION
    if (this.selectedexpenditure.includes('Transportation')) {
      const val = form.transportation?.transportationvalue;
      if (!val) {
        this.monthlyExpenditureForm.get('transportation')?.markAllAsTouched();
        invalid = true;
      } else {
        addItem('TRANSPORTATION', val);
      }
    }

    // SCHOOL
    if (this.selectedexpenditure.includes('SchoolEducationFees')) {
      const val = form.SchoolFees?.SchoolFeesvalue;
      if (!val) {
        this.monthlyExpenditureForm.get('SchoolFees')?.markAllAsTouched();
        invalid = true;
      } else {
        addItem('SCHOOL_EDUCATION_FEES', val);
      }
    }

    // MEDICAL
    if (this.selectedexpenditure.includes('Medical')) {
      const val = form.MedicalMedicines?.MedicalMedicinesvalue;
      if (!val) {
        this.monthlyExpenditureForm.get('MedicalMedicines')?.markAllAsTouched();
        invalid = true;
      } else {
        addItem('MEDICAL_MEDICINES', val);
      }
    }

    // OTHER
    if (this.selectedexpenditure.includes('Others')) {
      if (!form.other || form.other.length === 0) {
        this.other.markAllAsTouched();
        invalid = true;
      } else {
        form.other.forEach((item: any, i: number) => {
          const type = item.type === 'Other' ? item.customType : item.type;

          if (!type || !item.amount) {
            this.other.at(i).markAllAsTouched();
            invalid = true;
          } else {
            addItem('OTHER_RECURRING', item.amount, {
              expenseTypeText: type
            });
          }
        });
      }
    }

    if (invalid) {
      return { invalid: true, items: [] };
    }

    return {
      invalid: false,
      items
    };
  }
//draft payload for save exit

buildDraftMonthlyExpPayloadWithApplicantId(): {
  invalid: boolean;
  applicantId?: any;
  items: any[];
} {
  const form = this.monthlyExpenditureForm.getRawValue();
  const items: any[] = [];

  const cleanAmount = (val: any) =>
    val ? Number(val.toString().replace(/,/g, '')) : 0;

  const addItem = (code: string, value: any, extra: any = {}) => {
    if (!this.hasValue(value)) return;

    items.push({
      expenseType: code,
      amountInr: cleanAmount(value),
      ...extra
    });
  };

  // RENT
  if (this.selectedexpenditure.includes('RentHomeMaintenance')) {
    addItem('RENT_HOME_MAINTENANCE', form.rent?.rentvalue);
  }

  // GROCERY
  if (this.selectedexpenditure.includes('GroceriesandHousehold')) {
    addItem('GROCERIES_HOUSEHOLD', form.grocery?.groceryvalue);
  }

  // UTILITIES
  if (this.selectedexpenditure.includes('Utilities')) {
    addItem('TELEPHONE', form.utilities?.utilityvalue1, {
      expenseTypeText: 'Telephone and Internet bills'
    });

    addItem('UTILITIES', form.utilities?.utilityvalue2, {
      expenseTypeText: 'Utilities (Electricity, Water, Gas)'
    });
  }

  // TRANSPORTATION
  if (this.selectedexpenditure.includes('Transportation')) {
    addItem('TRANSPORTATION', form.transportation?.transportationvalue);
  }

  // SCHOOL
  if (this.selectedexpenditure.includes('SchoolEducationFees')) {
    addItem('SCHOOL_EDUCATION_FEES', form.SchoolFees?.SchoolFeesvalue);
  }

  // MEDICAL
  if (this.selectedexpenditure.includes('Medical')) {
    addItem('MEDICAL_MEDICINES', form.MedicalMedicines?.MedicalMedicinesvalue);
  }

  // OTHER
  if (this.selectedexpenditure.includes('Others') && Array.isArray(form.other)) {
    form.other.forEach((item: any) => {
      const type = item.type === 'Other' ? item.customType : item.type;

      if (this.hasValue(type) || this.hasValue(item.amount)) {
        if (this.hasValue(type) && this.hasValue(item.amount)) {
          addItem('OTHER_RECURRING', item.amount, {
            expenseTypeText: type
          });
        }
      }
    });
  }

  return {
    invalid: false,
    applicantId: this.getApiApplicantId(),
    items
  };
}
private hasValue(val: any): boolean {
  return val !== null && val !== undefined && val !== '';
}

  buildMonthlyExpPayloadWithApplicantId(): {
    invalid: boolean;
    applicantId?: any;
    items: any[];
  } {
    const result = this.buildMonthlyExpPayload();
 const applicantId = this.getApiApplicantId();

    
    if (result.invalid) {
      return {
        invalid: true,
        items: []
      };
    }

    return {
      invalid: false,
      applicantId: applicantId,
      items: result.items
    };
  }
  //get saved data from api
  getSavedMonthlyExp(applicantId: any): Promise<any> {
    return new Promise((resolve) => {
      this.formSvc.getSavedData(
        this.applicationId,
        applicantId,
        "SAVE_MONTHLY_EXPENSES"
      ).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            // resolve(res.data.data);
            
let data = res.data.data;

          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch {
              data = null;
            }
          }

          resolve(data);

          } else {
            resolve(null);
          }
        },
        error: () => resolve(null)
      });
    });
  }

  saveExit() {
  this.msgBox.open({
      title: 'Are you sure you want to exit?',
      message: ``,
      showCancel: true,
      onOk: () => {
    // const result = this.buildMonthlyExpPayloadWithApplicantId();

  const result = this.buildDraftMonthlyExpPayloadWithApplicantId();

    if (result.invalid) {
      console.log('Invalid form - not saving');
      return;
    }

    const input = { items: result.items, applicantId: result.applicantId };
 const applicantId = this.getApiApplicantId();

    if (!applicantId) {
      console.error('ApplicantId not found for photo upload');
      return;
    }

    const key = this.getStorageKey();
    // localStorage.setItem(key, JSON.stringify(input));
 this.storageservice.saveSectionData(
            'monthlyExpenditureData',
            this.applicationId,
            this.applicantId,
            this.isCoApplicant,
            JSON.stringify(input)
          );

    if (this.isCoApplicant) {
      this.formSvc.co_monthlyExpenditureData = input;
    } else {
      this.formSvc.monthlyExpenditureData = input;
    }

    const inputdata = {
      action: "auto-save",
      sectionKey: "SAVE_MONTHLY_EXPENSES",
      applicationId: this.applicationId,
      applicantId: applicantId,
      jsonData: input
    };

    this.formSvc.saveandExit(inputdata).subscribe({
      next: () => {
        this.lastSavedPayload = { ...input };
      }
    });
     this.router.navigate(['/admin/losoperation']);
     }
    });
  }
  getStepRoute() {
    // return this.isCoApplicant ? 'co_monthlyExpenditureData' : 'monthlyExpenditureData';

    return this.isCoApplicant ? 'co-monthlyexpinfo' : 'monthlyexpinfo';

  }
  next() {

    const result = this.buildMonthlyExpPayloadWithApplicantId();

    if (result.invalid) {
      console.log('Form invalid - stop navigation');
      return;
    }


    const payload = { items: result.items, applicantId: result.applicantId, };

    const hasChanged =
      !this.lastSavedPayload ||
      this.isPayloadChanged(payload, this.lastSavedPayload);

    const stepRoute = this.getStepRoute();

    if (!hasChanged) {
      console.log('No changes, skip API');
      this.stepperService.markStepCompleted(stepRoute);
      this.stepperService.setStepData(stepRoute, this.monthlyExpenditureForm.getRawValue());
      this.stepperService.next();
      return;
    }

    this.formSvc.MonthlyExpenditure(payload, this.applicationId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.lastSavedPayload = { ...payload };
          if (this.isCoApplicant) {
            this.formSvc.co_monthlyExpenditureData = payload;
          } else {
            this.formSvc.monthlyExpenditureData = payload;
          }

          // localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));
           this.storageservice.saveSectionData(
            'monthlyExpenditureData',
            this.applicationId,
            this.applicantId,
            this.isCoApplicant,
            JSON.stringify(payload)
          );

          this.stepperService.markStepCompleted(stepRoute);
          this.stepperService.setStepData(stepRoute, this.monthlyExpenditureForm.getRawValue());
          // this.stepperService.next();
          this.finishAfterSaveOrNoChange();
        }
      }
    });
  }
  next1() {


    let form = this.monthlyExpenditureForm.value;
    console.log("form", form);

    const items: any[] = [];

    let invalid = false;

    const cleanAmount = (val: any) =>
      val ? Number(val.toString().replace(/,/g, '')) : 0;

    const addItem = (code: string, value: any, extra: any = null) => {
      if (!value) return;

      items.push({
        expenseType: code,
        // amountInr: Number(value),
        amountInr: cleanAmount(value),
        ...extra
      });
    };

    const markGroupInvalid = (groupName: string) => {
      const group = this.monthlyExpenditureForm.get(groupName);
      group?.markAllAsTouched();
      invalid = true;
    };

    this.selectedexpenditure.forEach(key => {
      const config = this.fieldMap[key];
      if (!config) return;

      const groupName = config.form;
      const apiKey = config.api;

      const groupValue = form[groupName];

      if (groupName === 'utilities') {
        const map = {
          utilityvalue1: {
            type: 'UTILITIES',
            text: 'Telephone and Internet bills'
          },
          utilityvalue2: {
            type: 'UTILITIES',
            text: 'Utilities (Electricity, Water, Gas)'
          }
        } as const;


        (Object.keys(map) as Array<keyof typeof map>).forEach(key => {
          const val = groupValue?.[key];

          if (!val) {
            this.monthlyExpenditureForm.get(`utilities.${key}`)?.markAsTouched();
            invalid = true;
          } else {
            addItem(map[key].type, val, {
              expenseTypeText: map[key].text
            });
          }
        });
        return;
      }

      if (groupName === 'other') {

        if (!groupValue || groupValue.length === 0) {
          this.other.markAllAsTouched();
          invalid = true;
          return;
        }

        groupValue.forEach((item: any, i: number) => {
          const type = item.type === 'Other' ? item.customType : item.type;

          if (!type || !item.amount) {
            this.other.at(i).markAllAsTouched();
            invalid = true;
          } else {
            addItem('OTHER_RECURRING', item.amount, {
              expenseTypeText:
                item.type === 'Other'
                  ? item.customType
                  : item.type
            });
          }
        }
        );
      }

      //  normal groups
      else {
        const values = Object.values(groupValue).filter(v => v);

        if (!values.length) {
          this.monthlyExpenditureForm.get(groupName)?.markAllAsTouched();
          invalid = true;
        } else {
          values.forEach(val => addItem(apiKey, val));
        }
      }
    });

    if (invalid) return;

    const payload = { items };

    console.log("FINAL PAYLOAD:", payload);



    this.formSvc.MonthlyExpenditure(payload, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {
          this.formSvc.monthlyExpenditureData = payload;
          const key = `monthlyExpenditureData_main${this.applicantId}`;
          localStorage.setItem(key, JSON.stringify(payload));

          this.stepperService.markStepCompleted('monthlyexpinfo');

          this.stepperService.setStepData('monthlyexpinfo', this.monthlyExpenditureForm.getRawValue());

          this.stepperService.next();
        }
      }
    });
  }


  //edit from summary enable and disbale

   enableForm(){
    this.isViewMode = false;
    this.isEditMode = true;
    this.monthlyExpenditureForm.enable();
  }

  cancelSummaryEdit() {
    if (this.isEditMode && this.originalFormValue) {
      this.monthlyExpenditureForm.patchValue(this.originalFormValue);
    }

    this.isViewMode = false;
    this.isEditMode = false;

    this.router.navigate(['/applications', this.applicationId, 'summaryinfo']);
  }

  saveSummaryEdit() {
    const result = this.buildMonthlyExpPayloadWithApplicantId();

    if (result.invalid) {
      console.log('Form invalid - stop navigation');
      return;
    }


    const input = { items: result.items, applicantId: result.applicantId, };

    this.formSvc.MonthlyExpenditure(input, this.applicationId).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          const key = this.getStorageKey();
          localStorage.setItem(key, JSON.stringify(input));

          if (this.isCoApplicant) {
            this.formSvc.co_monthlyExpenditureData = input;
          } else {
            this.formSvc.monthlyExpenditureData = input;
          }

          this.lastSavedPayload = { ...input };

          console.log(res);

          this.isEditMode = false;

          this.isViewMode = false;

          // this.router.navigate(['/loanform/summaryinfo']);
        }
      },
      error: (err) => {
        console.error('Additional info update failed', err);
      }
    });
  }

}