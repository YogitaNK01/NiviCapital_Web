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
import { ActivatedRoute, Router } from '@angular/router';
import { Msgboxservice } from '../../../../core/service/msgboxservice';

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
  uploadedPreviewUrls: Record<string, string> = {};
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
  fileName: any;


  showMotherError = false;
  showFatherError = false;
  showSpouseError = false;
  submitAttempted = false;

  isCoApplicant: boolean = false;
  lastSavedPayload: any = null;

  photoPreviewUrl: string | null = null;
uploadedFileName: string | null = null;
localFiles: any = {};

//edit from summary
isFromSummary = false;
isViewMode = false;
isEditMode = false;
originalFormValue: any = null;

  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private router: Router, private stepperService: Loanstepperservice,
    private formSvc: Loanformservice, private msgBox: Msgboxservice,) { }
  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');

    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );

    this.stepperService.restoreLoanEditContext();
this.stepperService.restoreLoanIdFromSession();

    //application and applicant id of main-applicant 
    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];

    //application and applicant id of co-applicant  

    let AllCoapp_ids = this.stepperService.getCo_appId();



    if (this.isCoApplicant && (!AllCoapp_ids || !AllCoapp_ids[0] || !AllCoapp_ids[1])) {

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
          parsed.fullName,
        undefined,this.stepperService.getCurrentCoApplicantIndex());
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
    this.additionalinfoForm = this.fb.group({

      uploadphoto: [''],
      maritalstatus: ['', Validators.required,],
      gender: ['', Validators.required,],
      dependents: ['', [Validators.required]],
      s_fname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      s_lname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      spouseNoMiddleName: [false],
      f_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      f_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      fatherNoMiddleName: [false],
      m_fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      m_lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      motherNoMiddleName: [false],

    });

    this.additionalinfoForm.get('maritalstatus')?.valueChanges.subscribe(value => {

      this.updateSpouseValidators(value);
      // const sFname = this.additionalinfoForm.get('s_fname');
      // const sLname = this.additionalinfoForm.get('s_lname');

      // if (value === 'Married') {

      //   sFname?.setValidators([
      //     Validators.required,
      //     Validators.pattern('^[A-Za-z ]+$'),
      //     Validators.minLength(2),
      //     Validators.maxLength(25)
      //   ]);

      //   sLname?.setValidators([
      //     Validators.required,
      //     Validators.pattern('^[A-Za-z ]+$'),
      //     Validators.minLength(2),
      //     Validators.maxLength(25)
      //   ]);

      // } else {

      //   sFname?.clearValidators();
      //   sLname?.clearValidators();

      //   sFname?.setValue('');
      //   sLname?.setValue('');
      // }

      // sFname?.updateValueAndValidity();
      // sLname?.updateValueAndValidity();

    });

    if (this.formSvc.isEditFlow()) {
      setTimeout(() => {
        this.patchFromSummary();
      }, 300);
    } else {

      const key = this.getStorageKey();
      const localData = localStorage.getItem(key);
      const parsedLocal = localData ? JSON.parse(localData) : null;

      const apiData = await this.getSavedAdditionalInfo();

      let finalData = null;

      if (apiData) {
        finalData = apiData;
        localStorage.setItem(key, JSON.stringify(apiData));
      } else if (parsedLocal) {
        finalData = parsedLocal;
      }

      if (finalData) {
        if (this.isCoApplicant) {
          this.formSvc.co_additionalInfoData = finalData;
        } else {
          this.formSvc.additionalInfoData = finalData;
        }

        this.patchAdditionalInfo(finalData);
        this.updateSpouseValidators(this.additionalinfoForm.get('maritalstatus')?.value);

        this.lastSavedPayload = this.buildAdditionalPayload(this.additionalinfoForm.getRawValue());

        this.stepperService.markStepCompleted('additionalinfo');
      } else {
        this.lastSavedPayload = null;
      }


      let data = this.formSvc.additionalInfoData;

      if (!data) {
        const key = this.getStorageKey();

        const storedData = localStorage.getItem(key);

        if (storedData) {
          data = JSON.parse(storedData);
          // this.formSvc.additionalInfoData = data;

          if (this.isCoApplicant) {
            this.formSvc.co_additionalInfoData = data;
          } else {
            this.formSvc.additionalInfoData = data;
          }

          this.stepperService.markStepCompleted('additionalinfo');
        }
      }


      if (this.isCoApplicant) {
        this.patchAdditionalInfo(this.formSvc.co_additionalInfoData);
      } else {
        this.patchAdditionalInfo(this.formSvc.additionalInfoData);
      }

    }
  }

  getStorageKey() {
     const index = this.stepperService.getCurrentCoApplicantIndex();
    // return `kycinfo_coapp_${this.applicantId}_${index}`;

    return this.isCoApplicant
      ? `additionalinfo_coapp_${this.applicantId}_${index}`
      : `additionalinfo_main_${this.applicantId}`;
  }

  updateSpouseValidators(value: string) {
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


    if (!result || !result.file) {
      this.profilePhotoUrl = null;
      this.objectName = null;
      this.fileName = null;
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
        this.fileName = res.data.fileName;

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

  //file upload preview
  hasLocalFile(key: string): boolean {
    return !!this.uploadedFiles[key];
  }

setExistingFile(type: string, fileName: string, fileUrl: string) {
  this.localFiles[type] = {
    name: fileName,
    url: fileUrl,
    isExisting: true
  };
}

  getLocalFileName(key: string): string {
    return this.uploadedFiles[key]?.name || 'No file uploaded';
  }

  getLocalFileUrl(key: string): string {
    return this.uploadedPreviewUrls[key] || '';
  }

  viewLocalFile(key: string): void {
    const url = this.getLocalFileUrl(key);

    if (!url) return;

    window.open(url, '_blank');
  }

  downloadLocalFile(key: string): void {
    const file = this.uploadedFiles[key];

    if (!file) return;

    const url = this.getLocalFileUrl(key);

    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  }

  deleteLocalFile(key: string): void {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {
        this.uploadedFiles[key] = null;
        delete this.files[key];

        if (this.uploadedPreviewUrls[key]) {
          URL.revokeObjectURL(this.uploadedPreviewUrls[key]);
          delete this.uploadedPreviewUrls[key];
        }
      }
    });
  }

  back() {
    this.stepperService.previous();
  }
  //edit flow =patch from summary
  patchFromSummary() {
    if (!this.formSvc.isEditFlow()) return;

    const data = this.formSvc.getSummarySection('additionalInfo');
    console.log("patch", data)
    if (!data) return;
    const applicantDetails = data.applicantDetails || {};
    const spouse = data.spouse || {};
    const father = data.father || {};
    const mother = data.mother || {};

    
 if (applicantDetails.photoUrl && applicantDetails.fileName) {
    this.setExistingFile(
      'applicantphoto',
      applicantDetails.fileName,
      applicantDetails.photoUrl
    );
  }

    const genderValue =
      applicantDetails.gender == "M" ? "Male" :
        applicantDetails.gender == "F" ? "Female" : "Third Gender";

        
  this.photoPreviewUrl = applicantDetails.photoUrl || null;
  this.uploadedFileName = applicantDetails.fileName || null;


    this.additionalinfoForm.patchValue({

      uploadphoto:applicantDetails.fileName || '',
      maritalstatus: applicantDetails.maritalStatus ? applicantDetails.maritalStatus.charAt(0) + applicantDetails.maritalStatus.slice(1).toLowerCase() : '',
      // gender: data.gender == "M" ? "Male" : data.gender == "F" ? "Female" : 'O',
      dependents: applicantDetails.numberofDependents,

      s_fname: spouse.firstName,
      s_mname: spouse.middleName,
      s_lname: spouse.lastName,
      spouseNoMiddleName: spouse.spouseNoMiddleName,
      f_fname: father.firstName,
      f_mname: father.middleName,
      f_lname: father.lastName,
      fatherNoMiddleName: father.fatherNoMiddleName,
      m_fname: mother.firstName,
      m_mname: mother.middleName,
      m_lname: mother.lastName,
      motherNoMiddleName: mother.motherNoMiddleName,



    });
    this.additionalinfoForm.get('gender')?.setValue(genderValue, { emitEvent: false });
    this.gendercheck(genderValue);


    this.isfathermiddlename = !!father.fatherNoMiddleName;
    this.ismothermiddlename = !!mother.motherNoMiddleName;
    this.isspousemiddlename = !!spouse.spouseNoMiddleName;

    this.restoreMiddleNameState();

  }
  patchAdditionalInfo(data: any) {
    // const data = this.formSvc.additionalInfoData;

    if (!data) return;

    this.profilePhotoUrl = data.profilePhotoUrl || data.uploadphoto || '';
    this.fileName = data.fileName || '';
    this.objectName = data.objectName || '';

    const genderValue =
      data.gender == "M" ? "Male" :
        data.gender == "F" ? "Female" : "Third Gender";

    this.additionalinfoForm.patchValue({

      uploadphoto: this.profilePhotoUrl,
      maritalstatus: data.maritalStatus ? data.maritalStatus.charAt(0) + data.maritalStatus.slice(1).toLowerCase() : '',
      // gender: data.gender == "M" ? "Male" : data.gender == "F" ? "Female" : 'O',
      dependents: data.numberOfDependents,

      s_fname: data.spouseFirstName,
      s_mname: data.spouseMiddleName,
      s_lname: data.spouseLastName,
      spouseNoMiddleName: data.spouseNoMiddleName,
      f_fname: data.fatherFirstName,
      f_mname: data.fatherMiddleName,
      f_lname: data.fatherLastName,
      fatherNoMiddleName: data.fatherNoMiddleName,
      m_fname: data.motherFirstName,
      m_mname: data.motherMiddleName,
      m_lname: data.motherLastName,
      motherNoMiddleName: data.motherNoMiddleName,



    });

    this.additionalinfoForm.get('gender')?.setValue(genderValue, { emitEvent: false });
    this.gendercheck(genderValue);


    this.isfathermiddlename = !!data.fatherNoMiddleName;
    this.ismothermiddlename = !!data.motherNoMiddleName;
    this.isspousemiddlename = !!data.spouseNoMiddleName;

    this.restoreMiddleNameState();

  }

  private restoreMiddleNameState() {
    const form = this.additionalinfoForm;

    if (form.get('motherNoMiddleName')?.value) {
      form.get('m_mname')?.reset();
      form.get('m_mname')?.disable();
    }

    if (form.get('fatherNoMiddleName')?.value) {
      form.get('f_mname')?.reset();
      form.get('f_mname')?.disable();
    }

    if (form.get('spouseNoMiddleName')?.value) {
      form.get('s_mname')?.reset();
      form.get('s_mname')?.disable();
    }
  }

  onMotherNoMiddleNameChange(checked: boolean) {
    const ctrl = this.additionalinfoForm.get('m_mname');
    checked ? ctrl?.disable() : ctrl?.enable();
  }
  onFatherNoMiddleNameChange(checked: boolean) {
    const ctrl = this.additionalinfoForm.get('f_mname');
    checked ? ctrl?.disable() : ctrl?.enable();
  }
  onSpouseNoMiddleNameChange(checked: boolean) {
    const ctrl = this.additionalinfoForm.get('s_mname');
    checked ? ctrl?.disable() : ctrl?.enable();
  }


  get canProceed(): boolean {
    const f = this.additionalinfoForm.value;

    const fatherOk =
      this.isfathermiddlename || !!f.f_mname;

    const motherOk =
      this.ismothermiddlename || !!f.m_mname;

    const spouseOk =
      this.additionalinfoForm.get('maritalstatus')?.value !== 'Married' ||
      this.isspousemiddlename || !!f.s_mname;

    return (
      this.additionalinfoForm.valid &&
      fatherOk &&
      motherOk &&
      spouseOk
    );
  }

  saveExit() {
    let formdata = this.additionalinfoForm.getRawValue();
    const input = this.buildAdditionalPayload(formdata);

    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(input));

    const inputdata = {
      action: "auto-save",
      sectionKey: "PERSONAL_INFO",
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
  getSavedAdditionalInfo(): Promise<any> {
    let sectionkey = "PERSONAL_INFO"
    return new Promise((resolve) => {
      this.formSvc.getSavedData(this.applicationId, this.applicantId, sectionkey).pipe()

        .subscribe({
          next: (res) => {

            console.log(res)
            if (res.status === "success" && res.data?.data) {
              let data = res.data.data;

              if (typeof data === 'string') {
                try {
                  data = JSON.parse(data);
                } catch {
                  data = null;
                }
              }

              resolve(data);
            }
            else {
              resolve(null);
            }
          }, error: () => resolve(null)
        });
    });
  }

  isPayloadChanged(currentPayload: any, savedPayload: any): boolean {
    return JSON.stringify(currentPayload) !== JSON.stringify(savedPayload);
  }
  buildAdditionalPayload(formdata: any) {
    return {
      applicantId: this.applicantId,
      profilePhotoUrl: this.profilePhotoUrl || formdata.uploadphoto || '',
      fileName: this.fileName || this.formSvc.additionalInfoData?.fileName || this.formSvc.co_additionalInfoData?.fileName || '',
      objectName: this.objectName || this.formSvc.additionalInfoData?.objectName || this.formSvc.co_additionalInfoData?.objectName || '',

      maritalStatus: formdata.maritalstatus?.toUpperCase() || '',
      gender:
        this.gendercheckvalue === "Male"
          ? "M"
          : this.gendercheckvalue === "Female"
            ? "F"
            : "O",

      numberOfDependents: formdata.dependents || '',

      spouseFirstName: formdata.s_fname || '',
      spouseMiddleName: formdata.s_mname || '',
      spouseLastName: formdata.s_lname || '',
      spouseNoMiddleName: this.isspousemiddlename,

      fatherFirstName: formdata.f_fname || '',
      fatherMiddleName: formdata.f_mname || '',
      fatherLastName: formdata.f_lname || '',
      fatherNoMiddleName: this.isfathermiddlename,

      motherFirstName: formdata.m_fname || '',
      motherMiddleName: formdata.m_mname || '',
      motherLastName: formdata.m_lname || '',
      motherNoMiddleName: this.ismothermiddlename
    };
  }
  getStepRoute() {
    return this.isCoApplicant ? 'co-additionalinfo' : 'additionalinfo';
  }
  next() {
    this.submitAttempted = true;
    let formdata = this.additionalinfoForm.getRawValue();

    if (!this.canProceed) {
      return;
    }

    if (this.additionalinfoForm.invalid) {
      this.additionalinfoForm.markAllAsTouched();
      return;
    }
    //old input
    let input1 =

    {
      "applicantId": this.applicantId,
      "profilePhotoUrl": this.profilePhotoUrl,
      "fileName": this.fileName,
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
    //new input 
    const input = this.buildAdditionalPayload(formdata);
    const hasChanged = this.isPayloadChanged(input, this.lastSavedPayload);

    const stepRoute = this.getStepRoute();
    if (!hasChanged) {
      console.log('No changes detected, skipping API');

      this.stepperService.markStepCompleted(stepRoute);
      this.stepperService.setStepData(stepRoute, formdata);

      // this.stepperService.markStepCompleted('additionalinfo');
      // this.stepperService.setStepData('additionalinfo', formdata);
      this.stepperService.next();
      return;
    }



    this.formSvc.submitAdditionalInfo(input, this.applicationId).subscribe({
      next: (res) => {
        console.log(res);
        if (res.status == "success") {

          const key = this.getStorageKey();

          localStorage.setItem(key, JSON.stringify(input));


          if (this.isCoApplicant) {
            this.formSvc.co_additionalInfoData = input;
          } else {
            this.formSvc.additionalInfoData = input;
          }
          this.lastSavedPayload = { ...input };

          // this.stepperService.markStepCompleted('additionalinfo');
          // this.stepperService.setStepData('additionalinfo', formdata);
          this.stepperService.markStepCompleted(stepRoute);
          this.stepperService.setStepData(stepRoute, formdata);

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

  //edit from summary

  disableAdditionalInfoForm() {
  this.additionalinfoForm.disable({ emitEvent: false });
}

enableAdditionalInfoForm() {
  this.additionalinfoForm.enable({ emitEvent: false });

  this.restoreMiddleNameState();
  this.updateSpouseValidators(this.additionalinfoForm.get('maritalstatus')?.value);
}

onEditClick() {
  this.isViewMode = false;
  this.isEditMode = true;

  this.enableAdditionalInfoForm();

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      fromSummary: true,
      mode: 'edit'
    },
    queryParamsHandling: 'merge'
  });
}
cancelSummaryEdit() {
  if (this.isEditMode && this.originalFormValue) {
    this.additionalinfoForm.patchValue(this.originalFormValue);
  }

  this.router.navigate(['/applications', this.applicationId, 'summary']);
}
saveSummaryEdit() {
  this.submitAttempted = true;

  if (!this.canProceed) {
    this.additionalinfoForm.markAllAsTouched();
    return;
  }

  const formdata = this.additionalinfoForm.getRawValue();
  const input = this.buildAdditionalPayload(formdata);

  this.formSvc.submitAdditionalInfo(input, this.applicationId).subscribe({
    next: (res: any) => {
      if (res.status === 'success') {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(input));

        if (this.isCoApplicant) {
          this.formSvc.co_additionalInfoData = input;
        } else {
          this.formSvc.additionalInfoData = input;
        }

        this.lastSavedPayload = { ...input };

        this.router.navigate(['/applications', this.applicationId, 'summary']);
      }
    },
    error: (err) => {
      console.error('Additional info update failed', err);
    }
  });
}
}
