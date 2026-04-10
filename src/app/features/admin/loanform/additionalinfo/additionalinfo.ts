import { CommonModule } from '@angular/common';
import { Component, input, Input, OnInit } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

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
    accept: '.jpg, .jpeg',
    maxSize: 2,
    minSize: 50,
    helperText: 'JPG, JPEG (max. 2MB,min. 50KB)'
  };
  genderchecked: string = '';
  gendercheckvalue = ''
  isspousemiddlename = false
  isfathermiddlename = false
  ismothermiddlename = false

  requiredDocs = ['applicantphoto'];
  applicationId: any;
  applicantId: any;
  profilePhotoUrl: any;
  objectName: any;
  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private stepperService: Loanstepperservice, private formSvc: Loanformservice) { }
  ngOnInit(): void {
this.stepperService.rebuildSteps();
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.additionalinfoForm = this.fb.group({

      uploadphoto: [''],
      maritalstatus: ['', Validators.required,],
      gender: ['', Validators.required,],
      dependents: ['', [Validators.required]],
      s_fname: ['', [ Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_lname: ['', [ Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],


    });

      if(this.formSvc.additionalInfoData){
      this.patchAdditionalInfo();
    }
  
this.additionalinfoForm.get('maritalstatus')?.valueChanges.subscribe(value => {

  const sFname = this.additionalinfoForm.get('s_fname');
  const sLname = this.additionalinfoForm.get('s_lname');

  if (value === 'Married') {

    sFname?.setValidators([
      Validators.required,
      Validators.pattern('^[A-Za-z ]+$'),
      Validators.minLength(2),
      Validators.maxLength(25)
    ]);

    sLname?.setValidators([
      Validators.required,
      Validators.pattern('^[A-Za-z ]+$'),
      Validators.minLength(2),
      Validators.maxLength(25)
    ]);

  } else {

    sFname?.clearValidators();
    sLname?.clearValidators();

    sFname?.setValue('');
    sLname?.setValue('');
  }

  sFname?.updateValueAndValidity();
  sLname?.updateValueAndValidity();

});
  }
  get f() {
    return this.additionalinfoForm.controls;
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
    console.log(result);


    if (!result || !result.file)  {
    this.profilePhotoUrl = null;
    this.objectName = null;
    this.additionalinfoForm.get('uploadphoto')?.setValue(null);
    this.additionalinfoForm.get('uploadphoto')?.markAsTouched();
    return;
  }
    const fd = new FormData();
    fd.append('applicantId', this.applicantId);
    fd.append('file', result.file);

    this.formSvc.uploadPhoto(fd).subscribe({
      next: (res) => {
        console.log(res);
        this.profilePhotoUrl = res.data.publicUrl;
        this.objectName = res.data.objectName;

        this.additionalinfoForm.patchValue({
          uploadphoto: this.profilePhotoUrl
        });
        // this.additionalinfoForm.get('uploadphoto')?.setValue(this.profilePhotoUrl);
        this.additionalinfoForm.get('uploadphoto')?.markAsDirty();
        this.additionalinfoForm.get('uploadphoto')?.updateValueAndValidity();


      },
      error: (error) => {
        console.log(error);
      }
    });


  }



  gendercheck(value: string): void {
    this.gendercheckvalue = value
    this.additionalinfoForm.patchValue({
      gender: value
    });

    this.additionalinfoForm.get('gender')?.updateValueAndValidity();

  }

  back() {
    this.stepperService.previous();
  }

  patchAdditionalInfo() {
  const data = this.formSvc.additionalInfoData;

  if (!data) return;

  this.additionalinfoForm.patchValue({
    uploadphoto: data.uploadphoto,
    maritalstatus: data.maritalstatus,
    gender: data.gender,
    dependents: data.dependents,

    s_fname: data.s_fname,
    s_mname: data.s_mname,
    s_lname: data.s_lname,

    f_fname: data.f_fname,
    f_mname: data.f_mname,
    f_lname: data.f_lname,

    m_fname: data.m_fname,
    m_mname: data.m_mname,
    m_lname: data.m_lname
  });
}
  next() {
  console.log("form--", this.additionalinfoForm.value);
    if (!this.additionalinfoForm.valid) {
      console.log("form invalid");
      return;
    }

  
    let formdata = this.additionalinfoForm.value;

    let input =

    {
      "applicantId": this.applicantId,
      "profilePhotoUrl": this.profilePhotoUrl,
      "objectName": this.objectName,

      "maritalStatus": formdata.maritalstatus.toUpperCase(),
      "gender": this.gendercheckvalue == "Male" ? "M" : this.gendercheckvalue == "Female" ? "F" : 'O',

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
         this.formSvc.additionalInfoData = input;
          this.stepperService.next();
        }

      },
      error: (err) => {
        console.error("error msg", err);
      }

    });


    // this.stepperService.setStepData('educationDetails', this.registerForm.value);

    // this.stepperService.next();

  }
}
