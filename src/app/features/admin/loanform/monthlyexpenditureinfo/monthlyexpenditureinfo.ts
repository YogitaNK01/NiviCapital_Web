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

  createOther(): FormGroup {
    return this.fb.group({
      othervalue1: ['', Validators.required],
      othervalue2: ['', Validators.required]
    });
  }
    addmore() {
   
  this.other.push(this.createOther());

  }

  onAssetChange(values: string | string[]): void {
    this.selectedexpenditure = Array.isArray(values) ? values : [values];

    this.openIndex = [];

    this.selectedexpenditure.forEach(val => {
      const index = this.accordions.findIndex(a => a.key === val);
      if (index !== -1) {
        this.openIndex.push(index);
      }
    });
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


  back() {
    this.stepperService.previous();
  }


  next() {
    this.stepperService.next();
  }

}
