import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';

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
    { title: 'Others', alwaysOpen: true, key: 'Others' },
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
  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

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
    this.selectedexpenditure = Array.isArray(values) ? values : [values];

    this.openIndex = [];

    this.selectedexpenditure.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
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

    event.stopPropagation();

    this.selectedexpenditure =
      this.selectedexpenditure.filter(k => k !== key);

    this.openIndex =
      this.openIndex.filter(i => i !== index);

    this.monthlyExpenditureForm.get(key)?.reset();

  }
  removeAccordion1(key: string, index: number, event: Event) {
    event.stopPropagation();

    this.selectedexpenditure =
      this.selectedexpenditure.filter(k => k !== key);

    this.openIndex =
      this.openIndex.filter(i => i !== index);

    const groupName = this.fieldMap[key];

    if (groupName === 'other') {
      this.other.clear();
      this.other.push(this.createOther());
    } else {
      this.monthlyExpenditureForm.get(groupName)?.reset();
    }
  }

  back() {
    this.stepperService.previous();
  }


  next() {


    //   if (!this.monthlyExpenditureForm.valid) {
    //   console.log("form invalid");
    //   return;
    // }

    let form = this.monthlyExpenditureForm.value;
    console.log("form", form);

    const items: any[] = [];

    let invalid = false;

    const addItem = (code: string, value: any, extra: any = null) => {
      if (!value) return;

      items.push({
        expenseType: code,
        amountInr: Number(value),
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
          utilityvalue1: 'TELEPHONE',
          utilityvalue2: 'UTILITIES'
        } as const

        (Object.keys(map) as Array<keyof typeof map>).forEach(key => {
          const val = groupValue[key];

          if (!val) {
            this.monthlyExpenditureForm.get(`utilities.${key}`)?.markAsTouched();
            invalid = true;
          } else {
            addItem(map[key], val);
          }
        });
        return;
      }

      if (groupName === 'other') {
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

    // if (invalid) return;

    const payload = { items };

    console.log("FINAL PAYLOAD:", payload);



    this.formSvc.MonthlyExpenditure(payload, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {

          this.stepperService.next();
        }
      }
    });
  }

}
