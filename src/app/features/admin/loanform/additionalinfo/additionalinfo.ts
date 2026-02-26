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
import { Loanformservice } from '../../../../core/service/loanformservice';

@Component({
  selector: 'app-additionalinfo',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn, Radiobuttons, Inputfield],
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
    { label: 'Single', value: 'Single', icon: '' },
    { label: 'Married', value: 'Married', icon: '' },
    { label: 'Divorced', value: 'Divorced', icon: '' },
    { label: 'Widowed', value: 'Widowed', icon: '' },
    { label: 'Separated', value: 'Separated', icon: '' },
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
  genderchecked: string = '';
  gendercheckvalue = ''
  isspousemiddlename = false
  isfathermiddlename = false
  ismothermiddlename = false

  requiredDocs = ['applicantphoto'];
 applicationId :any;
  constructor(private fb: FormBuilder, public main: Main, private stepperService: Loanstepperservice, private formSvc: Loanformservice) { }
  ngOnInit(): void {
    this.additionalinfoForm = this.fb.group({

      // uploadphoto: ['', Validators.required],
      maritalstatus: ['', Validators.required,],
      gender: ['', Validators.required,],
      dependents: ['', Validators.required,],
      s_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_mname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_mname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_mname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],


    });

    this.applicationId = this.stepperService.getLoanId();

  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  submit() {
    if (this.additionalinfoForm.invalid) return;

    console.log(this.additionalinfoForm.value);
  }

  onmiddlename(value: boolean): void {
    this.isspousemiddlename = value;
  }
  onfathermiddlename(value: boolean): void {
    this.isfathermiddlename = value;
  }
  onmothermiddlename(value: boolean): void {
    this.ismothermiddlename = value;
  }
  onFileChange(result: UploadResult, key: string) {

    if (!result.file) {
      this.uploadedFiles[key] = null;
      return;
    }

    this.files[key] = result.file;
    this.uploadedFiles[key] = result.file;

  }

  get allRequiredFilesUploaded(): boolean {

    let docsToCheck = [...this.requiredDocs];

    return docsToCheck.every(k => !!this.uploadedFiles[k]);
  }
  gendercheck(value: string): void {
    this.gendercheckvalue = value
  }

  back() {
    this.stepperService.previous();
  }

  next() {
    console.log("form--", this.additionalinfoForm.value);
    let formdata = this.additionalinfoForm.value;

    let input =
   
    {
      "applicantId": this.applicationId,
      "profilePhotoUrl": "https://example.com/profile/photo.jpg",

      "maritalStatus": formdata.maritalstatus,
      "gender": this.gendercheckvalue == "Male" ? "M" : this.gendercheckvalue == "Female" ? "F" : 'T',

      "numberOfDependents": formdata.dependents,

      "spouseFirstName": formdata.s_fname,
      "spouseMiddleName": formdata.s_mname,
      "spouseLastName": formdata.s_lname,
      "spouseNoMiddleName": this.isspousemiddlename,

      "fatherFirstName": formdata.f_fname,
      "fatherMiddleName": formdata.f_mname,
      "fatherLastName": formdata.f_lname,
      "fatherNoMiddleName": this.isfathermiddlename,

      "motherFirstName": formdata.m_fname,
      "motherMiddleName": formdata.m_mname,
      "motherLastName": formdata.m_lname,
      "motherNoMiddleName": this.ismothermiddlename
    }

    console.log(input);
    this.formSvc.submitAdditionalInfo(input, this.applicationId).subscribe({
      next: (res) => {
        console.log(res);
        if (res.status == "success") {
          // this.stepperService.setStepData('educationDetails', this.registerForm.value);
          // this.stepperService.next();
        }

      },
      error: (err) => {
        console.error("error msg", err);
      }

    });


    // this.stepperService.setStepData('educationDetails', this.registerForm.value);

    this.stepperService.next();

  }
}
