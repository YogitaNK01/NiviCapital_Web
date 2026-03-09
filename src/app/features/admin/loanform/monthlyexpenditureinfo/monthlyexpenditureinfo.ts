import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';

@Component({
  selector: 'app-monthlyexpenditureinfo',
  imports: [CommonModule,ReactiveFormsModule,Buttons,Dropdown,Inputfield],
  standalone:true,
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
    // { title: 'Others', alwaysOpen: true, key: 'Others' },
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
  selectedliabilities: string[] = [];

  assetsForm!: FormGroup;

  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute,
     private stepperService: Loanstepperservice, private formSvc: Loanformservice,private cd:ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.assetsForm = this.fb.group({
      goldvalue: [''],
      cashinhand: [''],
      savingbalance: [''],
      marketval: [''],
      location: [''],
      bankname:[''],
      bankamt:[''],
      maturitydate:[],
      stockvalue:[''],
      mutualfundvalue:['']
    });

  }

  onAssetChange(values: string | string[]): void {
    this.selectedliabilities = Array.isArray(values) ? values : [values];

  this.openIndex = [];

  this.selectedliabilities.forEach(val => {
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
    if (this.assetsForm.invalid) return;

    console.log(this.assetsForm.value);
  }

  addmore() {
    
  }
  back() {
    this.stepperService.previous();
  }


  next() {
    this.stepperService.next();
  }

}
