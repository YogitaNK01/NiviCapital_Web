import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

      
const key = `monthlyExpenditureData_${this.applicantId}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      this.formSvc.monthlyExpenditureData = JSON.parse(saved);
    }

    //   AFTER restore → patch
    if (this.formSvc.monthlyExpenditureData) {
      this.patchMonthlyExpenditure();
    }


    });



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

  patchMonthlyExpenditure() {
    const data = this.formSvc.monthlyExpenditureData;

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
          rentvalue: item.amountInr
        });
      }

      // ---------------- GROCERY ----------------
      if (item.expenseType === 'GROCERIES_HOUSEHOLD') {
        this.selectedexpenditure.push('GroceriesandHousehold');

        this.monthlyExpenditureForm.get('grocery')?.patchValue({
          groceryvalue: item.amountInr
        });
      }

      // ---------------- UTILITIES ----------------
      if (item.expenseType === 'TELEPHONE') {
        this.selectedexpenditure.push('Utilities');

        this.monthlyExpenditureForm.get('utilities')?.patchValue({
          utilityvalue1: item.amountInr
        });
      }

      if (item.expenseType === 'UTILITIES') {
        this.selectedexpenditure.push('Utilities');

        this.monthlyExpenditureForm.get('utilities')?.patchValue({
          utilityvalue2: item.amountInr
        });
      }

      // ---------------- TRANSPORT ----------------
      if (item.expenseType === 'TRANSPORTATION') {
        this.selectedexpenditure.push('Transportation');

        this.monthlyExpenditureForm.get('transportation')?.patchValue({
          transportationvalue: item.amountInr
        });
      }

      // ---------------- SCHOOL ----------------
      if (item.expenseType === 'SCHOOL_EDUCATION_FEES') {
        this.selectedexpenditure.push('SchoolEducationFees');

        this.monthlyExpenditureForm.get('SchoolFees')?.patchValue({
          SchoolFeesvalue: item.amountInr
        });
      }

      // ---------------- MEDICAL ----------------
      if (item.expenseType === 'MEDICAL_MEDICINES') {
        this.selectedexpenditure.push('Medical');

        this.monthlyExpenditureForm.get('MedicalMedicines')?.patchValue({
          MedicalMedicinesvalue: item.amountInr
        });
      }

      // ---------------- OTHER ----------------
      // this.monthlyExpenditureForm.setControl('other', this.fb.array([]));
      if (item.expenseType === 'OTHER_RECURRING') {
        this.selectedexpenditure.push('Others');

        const group = this.createOther();

        group.patchValue({
          type: this.getOtherType(item.expenseTypeText),
          customType: item.expenseTypeText,
          amount: item.amountInr
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


  next() {


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
          const key = `monthlyExpenditureData_${this.applicantId}`;
localStorage.setItem(key, JSON.stringify(payload));

          this.stepperService.markStepCompleted('monthlyexpinfo');

          this.stepperService.setStepData('monthlyexpinfo', this.monthlyExpenditureForm.getRawValue());

          this.stepperService.next();
        }
      }
    });
  }

}