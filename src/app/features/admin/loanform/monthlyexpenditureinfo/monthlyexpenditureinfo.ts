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
  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private msgBox: Msgboxservice, private router: Router,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');
    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );
    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    // this.custName = Allids[2];
    // this.custARN = Allids[3];

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
          parsed.fullName
        );
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

 if (this.formSvc.isEditFlow()) {
      setTimeout(() => {
        this.patchFromSummary();
      }, 300);
    } else {

    const key = this.getStorageKey();
    const localData = localStorage.getItem(key);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    const apiData = await this.getSavedMonthlyExp();

    let finalData = null;

    if (apiData) {
      finalData = apiData;
      localStorage.setItem(key, JSON.stringify(apiData));
    } else if (parsedLocal) {
      finalData = parsedLocal;
    }

    if (finalData) {

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

      this.stepperService.markStepCompleted(this.getStepRoute());

    }
  }

  }

  getStorageKey() {
    return this.isCoApplicant
      ? `monthlyExpenditureData_coapp_${this.applicantId}`
      : `monthlyExpenditureData_main_${this.applicantId}`;
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
patchFromSummary() {
  if (!this.formSvc.isEditFlow()) return;

  const data = this.formSvc.getSummarySection('monthlyExpenditure');
  console.log('patch monthly expenditure', data);

  if (!data) return;

  const items: any[] = [];

  if (data.rentHomeMaintenance?.amountInr) {
    items.push({
      expenseType: 'RENT_HOME_MAINTENANCE',
      amountInr: data.rentHomeMaintenance.amountInr
    });
  }

  if (data.groceriesHousehold?.amountInr) {
    items.push({
      expenseType: 'GROCERIES_HOUSEHOLD',
      amountInr: data.groceriesHousehold.amountInr
    });
  }

  (data.utilitiesElectricityWaterGas || []).forEach((item: any) => {
    const name = item.name || '';

    items.push({
      expenseType: name.toLowerCase().includes('telephone')
        ? 'TELEPHONE'
        : 'UTILITIES',
      expenseTypeText: name,
      amountInr: item.amountInr || 0
    });
  });

  if (data.transportation?.amountInr) {
    items.push({
      expenseType: 'TRANSPORTATION',
      amountInr: data.transportation.amountInr
    });
  }

  if (data.schoolEducationFees?.amountInr) {
    items.push({
      expenseType: 'SCHOOL_EDUCATION_FEES',
      amountInr: data.schoolEducationFees.amountInr
    });
  }

  if (data.medicalMedicines?.amountInr) {
    items.push({
      expenseType: 'MEDICAL_MEDICINES',
      amountInr: data.medicalMedicines.amountInr
    });
  }

  (data.otherRecurringExpenses || []).forEach((item: any) => {
    items.push({
      expenseType: 'OTHER_RECURRING',
      expenseTypeText: item.name || '',
      amountInr: item.amountInr || 0
    });
  });

  const mappedData = {
    applicantId: this.applicantId,
    items
  };

  if (this.isCoApplicant) {
    this.formSvc.co_monthlyExpenditureData = mappedData;
  } else {
    this.formSvc.monthlyExpenditureData = mappedData;
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

  buildMonthlyExpPayloadWithApplicantId(): {
    invalid: boolean;
    applicantId?: any;
    items: any[];
  } {
    const result = this.buildMonthlyExpPayload();

    if (result.invalid) {
      return {
        invalid: true,
        items: []
      };
    }

    return {
      invalid: false,
      applicantId: this.applicantId,
      items: result.items
    };
  }
  //get saved data from api
  getSavedMonthlyExp(): Promise<any> {
    return new Promise((resolve) => {
      this.formSvc.getSavedData(
        this.applicationId,
        this.applicantId,
        "SAVE_MONTHLY_EXPENSES"
      ).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            resolve(res.data.data);
          } else {
            resolve(null);
          }
        },
        error: () => resolve(null)
      });
    });
  }

  saveExit() {

    const result = this.buildMonthlyExpPayloadWithApplicantId();

    if (result.invalid) {
      console.log('Invalid form - not saving');
      return;
    }

    const input = { items: result.items, applicantId: result.applicantId };


    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(input));


    if (this.isCoApplicant) {
      this.formSvc.co_monthlyExpenditureData = input;
    } else {
      this.formSvc.monthlyExpenditureData = input;
    }

    const inputdata = {
      action: "auto-save",
      sectionKey: "SAVE_MONTHLY_EXPENSES",
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      jsonData: input
    };

    this.formSvc.saveandExit(inputdata).subscribe({
      next: () => {
        this.lastSavedPayload = { ...input };
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

          localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));

          this.stepperService.markStepCompleted(stepRoute);
          this.stepperService.setStepData(stepRoute, this.monthlyExpenditureForm.getRawValue());
          this.stepperService.next();
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

}