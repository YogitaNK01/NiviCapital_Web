import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder, MinLengthValidator, MaxLengthValidator } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Main } from '../../../../core/service/main';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-additionalinfo',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn, Radiobuttons,Inputfield],
  standalone: true,
  templateUrl: './additionalinfo.html',
  styleUrl: './additionalinfo.scss'
})
export class Additionalinfo implements OnInit {
  openIndex: number | null = 0;
  accordions = [
    { title: 'Main Applicant ', alwaysOpen: true },

  ];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';
  marital_status: DropdownOption[] = [
    { label: 'Married', value: 'married', icon: '' },
    { label: 'Single', value: 'single', icon: '' },
  ];

  dependents: string = 'Number Of Dependents';
  dependentscount: DropdownOption[] = [
    { label: '1', value: '1', icon: '' },
    { label: '2', value: '2', icon: '' },
  ];


  additionalinfoForm!: FormGroup;

  uploadedFiles: Record<string, File | null> = {};
  files: any = {};
  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg,',
    maxSize: 2,
    helperText: 'JPG, JPEG, PDF, PNG, (max. 2 MB)'
  };

  gendercheck = ''
ismiddlename = false
  constructor(private fb: FormBuilder, public main: Main,private stepperService:Loanstepperservice) { }
  ngOnInit(): void {
    this.additionalinfoForm = this.fb.group({

      uploadphoto: ['', Validators.required],
      maritalstatus: ['', Validators.required, ],
      gender: ['', Validators.required, ],
      dependents: ['', Validators.required, ],
      s_fname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      s_mname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      s_lname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      f_fname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      f_mname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      f_lname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      m_fname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      m_mname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],
      m_lname: ['', Validators.required,Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2),Validators.maxLength(25)],


    });
  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  submit() {
    if (this.additionalinfoForm.invalid) return;

    console.log(this.additionalinfoForm.value);
  }

  onmiddlename(value: boolean): void {
    this.ismiddlename = value;
  }
  onFileChange(result: UploadResult, key: string) {

    if (!result.file) {
      this.uploadedFiles[key] = null;
      return;
    }

    this.files[key] = result.file;
    this.uploadedFiles[key] = result.file;

  }

   back(){
    this.stepperService.previous();
  }
   next() {
  this.stepperService.next();
}
}
