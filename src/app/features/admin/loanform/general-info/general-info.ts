import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';


@Component({
  selector: 'app-general-info',
  imports: [CommonModule, Inputfield, Dropdown, Buttons, Radiobuttons, Datepickernew, ReactiveFormsModule],
  standalone: true,
  templateUrl: './general-info.html',
  styleUrl: './general-info.scss'
})
export class GeneralInfo implements OnInit {

  openIndex: number | null = 0;
  accordions = [
    { title: 'Identity & Residency ', alwaysOpen: true },

  ];

  registerForm!: FormGroup;
  checkyes_rb = "option1"


  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  formData: any = {};

  occupation: string = 'Current Occupation';
  selectoccupation: DropdownOption[] = [
    { label: 'Loan', value: 'Loan', icon: '' },
  ];


  qualification: string = 'Last Qualification';
  seleactqualification: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]

state: string = 'Select state';
  selectostate: DropdownOption[] = [
    { label: 'abc', value: 'educationloan', icon: '' },
  ]
university:string = 'Select university';
  selectuniversity: DropdownOption[] = [
    { label: 'abc', value: 'educationloan', icon: '' },
  ]

  coursetype: string = 'Select Segment';
  selectcoursetype: DropdownOption[] = [
    { label: 'Retail', value: 'retail', icon: '' },
    { label: 'Corporate', value: 'corporate', icon: '' },
    { label: 'MSME', value: 'msme', icon: '' },
  ];


  coursename: string = 'Select Category';
  selectcoursename: DropdownOption[] = [
    { label: 'Education Loan', value: 'educationloan', icon: '' },
  ]

  courseduration: string = 'Select Category';
  selectcourseduration: DropdownOption[] = [
    { label: 'Education Loan', value: 'educationloan', icon: '' },
  ]
  lendingpartner: string = 'Select Category';
  selectlendingpartner: DropdownOption[] = [
    { label: 'Education Loan', value: 'educationloan', icon: '' },
  ]
  



  constructor(private fb: FormBuilder, private formSvc: Loanformservice) { }
  ngOnInit() {
    this.registerForm = this.fb.group({

      occupation: ['', Validators.required],
      qualification: ['', Validators.required, Validators.pattern('^[A-Za-z ]+$')],
      institutionName: ['', Validators.required, Validators.pattern('^[A-Za-z ]+$')],
      state: ['', Validators.required],
        university: ['', Validators.required],
      coursetype: ['', Validators.required],
      coursename: ['', Validators.required],
      courseduration: ['', Validators.required],
      coursestartdate: ['', Validators.required],
      courseenddate: ['', Validators.required],
      checkedasset: ['', Validators.required],
      lendingpartner: ['', Validators.required],


    });
  }

  get form() {
    return this.formSvc.form.get('loanInfo') as FormGroup;
  }

  saveDraft() {
    // const data = this.masterForm.value;
    // this.api.saveDraft(data).subscribe();
  }
  onSelectionChange(selectedkey: string, value: string) {
    this.formData[selectedkey] = value;
    console.log('Changed:', selectedkey, value);
  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  submit() {
    if (this.registerForm.invalid) return;

    console.log(this.registerForm.value);
  }

  get f() {
    return this.registerForm.controls;
  }
}
