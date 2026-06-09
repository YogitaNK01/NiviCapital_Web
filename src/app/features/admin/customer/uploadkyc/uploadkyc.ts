import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Main } from '../../../../core/service/main';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Uploadbtn, UploadConfig, UploadResult } from "../../../systemdesign/uploadbtn/uploadbtn";
import { Datepickernew } from "../../../systemdesign/datepickernew/datepickernew";
import { Dropdown } from "../../../systemdesign/dropdown/dropdown";
import { Checkbox } from "../../../systemdesign/checkbox/checkbox";
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import moment from 'moment';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { NgForm } from '@angular/forms';
import { Successbox } from '../successbox/successbox';

interface OptionItem {
  label: string;
  value: string;
}
@Component({
  selector: 'app-uploadkyc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Inputfield, Uploadbtn, Datepickernew, Dropdown, Checkbox, Buttons,Successbox],
  templateUrl: './uploadkyc.html',
  styleUrl: './uploadkyc.scss'
})
export class Uploadkyc implements OnDestroy, AfterViewInit {
  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };
  selectedOption: any;
  addressType: 'same' | 'different' = 'same';
  ismailingaddress: 'same' | 'different' = 'same';
  isDifferentAddress: boolean = false;
  selectedSecondaryProof: string | null = null;
  permanentMailingFlag = 0;
  currentMailingFlag = 0;
  isPermanentMailingChecked = true;
  isCurrentMailingChecked = false;
  files: any = {};

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevstep = new EventEmitter<void>();
  @Output() fileChange = new EventEmitter<File>();
  @Output() ncid = new EventEmitter<string>();
  @Output() kycid = new EventEmitter<string>();

  openIndex: number[] = [0, 1];
  accordions = [
    { title: 'Identity & Residency ', alwaysOpen: true },
    { title: 'Permanent Address ', alwaysOpen: false },
    { title: 'Current Address ', alwaysOpen: false },
  ];
  isMailingAddress: boolean = false;

  perStateSelectedOption: any;
  perCitySelectedOption: any;
  currStateSelectedOption: any;
  currCitySelectedOption: any;


  stateOptions: OptionItem[] = [];
  cityOptions: OptionItem[] = [];

  currstateOptions: OptionItem[] = [];
  currcityOptions: OptionItem[] = [];

  perselectedStateId!: string;
  currselectedStateId!: string;
  perselectedStateLabel!: string;
  currselectedStateLabel!: string;

  perselectedCityId!: string;
  currselectedCityId!: string;
  perselectedCityLabel!: string;
  currselectedCityLabel!: string;


  placeholderstate: string = 'Select State';
  placeholdercity: string = 'Select City';


  requiredDocs = ['aadharfront', 'aadharback', 'pan'];   // only required ones
  optionalDocs = ['passport', 'bill', 'secaddress'];

  uploadedFiles: Record<string, File | null> = {};
  uploadedPreviewUrls: Record<string, string> = {};

  // dob: any;
  selectstate_: any;
  selectcity_: any;
  userdata: any;
  userid: any;
  co_userid: any;

  editMode = false;
  editUserData: any = {};
  dobValid = false;
  dobTouched = false;
  @ViewChild('kycForm') kycForm!: NgForm;

  applicationId: any;
  applicantId: any;
  lastSavedPayload: any = null;
  isCoApplicant: boolean = false;
  uploadedFileMeta: Record<string, any> = {};
issuccess:boolean= false;
  constructor(public main: Main, private addcustomerservice: Addcustomerservice, private route: ActivatedRoute, private stepperService: Loanstepperservice, private loanservice: Loanformservice, private msgBox: Msgboxservice, private router: Router) { }

  ngOnInit(): void {
    this.isCoApplicant = this.router.url.includes('co-applicant');
    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );

    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids?.[0];
    this.applicationId = Allids?.[1];

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

        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
          undefined,this.stepperService.getCurrentCoApplicantIndex()
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


    this.states();
    const cifDetails = sessionStorage.getItem('cifdetails');
    this.userid = this.safeParse(cifDetails);

    const userDetails = sessionStorage.getItem('userdetails');
    this.userdata = this.safeParse(userDetails);

    const coapp_cifDetails = sessionStorage.getItem('coapp_cifdetails');
    this.co_userid = this.safeParse(coapp_cifDetails);

    const editUser = sessionStorage.getItem('editUser');

    if (editUser) {
      this.editMode = true;
      this.editUserData = JSON.parse(editUser);
    }
    this.requiredDocs.forEach(k => this.uploadedFiles[k] = null);
    this.optionalDocs.forEach(k => this.uploadedFiles[k] = null);



  }


  ngAfterViewInit(): void {
    setTimeout(() => {

      if (!this.isCoApplicant) {
        return;
      }

      if (this.loanservice.isEditFlow()) {
        this.patchFromSummary();
      } else {
        this.restoreKycData();
      }
    }, 500);
  }



  getStorageKey() {
    // return `kycinfo_coapp_${this.applicantId}`;
     const index = this.stepperService.getCurrentCoApplicantIndex();
    return `kycinfo_coapp_${this.applicantId}_${index}`;
  }

  goToDashboard() {

    this.msgBox.open({
      title: 'Are you sure want to go to Dashboard?',
      message: ``,
      showCancel: true,
      onOk: () => {
        this.prevstep.emit();

      }
    });

  }

  safeParse(value: string | null) {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
  }


  checkSequential(value: string, control: any) {

    if (!value || value.length < 12) return;

    if (this.isSequential(value)) {
      control.control.setErrors({ sequential: true });
    } else {

      const errors = control.control.errors;

      if (errors) {
        delete errors['sequential'];
        if (Object.keys(errors).length === 0) {
          control.control.setErrors(null);
        } else {
          control.control.setErrors(errors);
        }
      }
    }

  }
  isSequential(num: string) {

    const ascSeq = "01234567890123456789";
    const descSeq = "98765432109876543210";

    for (let i = 0; i <= num.length - 6; i++) {
      const part = num.substring(i, i + 6);

      if (ascSeq.includes(part) || descSeq.includes(part)) {
        return true;
      }
    }

    return false;
  }

  selectSameAddress(checked: boolean) {


    this.addressType = 'same';
    this.isDifferentAddress = false;
    this.selectedSecondaryProof = null;
    this.isCurrentMailingChecked = false;
    this.isPermanentMailingChecked = true;
  }

  selectDifferentAddress(checked: boolean) {


    this.addressType = 'different';
    this.currstateOptions = [];
    this.currcityOptions = [];
    this.isDifferentAddress = true;

    this.isCurrentMailingChecked = true;
    this.isPermanentMailingChecked = false;
    this.states();
  }

  checkDob(value: any) {
    this.dobTouched = true;
    this.dobValid = this.isAdult(value);
  }
  isAdult(date: any): boolean {

    if (!date) return false;

    const age = moment().diff(date, 'years');

    return age >= 18;


  }
  kycupload1(form: any) {
    console.log(form.value);


    if (!form.valid) {
      console.log("form invalid");
      return;
    }
    const firstName = this.editMode ? this.editUserData.fname : this.isCoApplicant ? this.co_userid.fullName : this.userdata.fname;

    const lastName = this.editMode ? this.editUserData.lname : this.isCoApplicant ? this.co_userid.fullName : this.userdata.lname;

    const custid = this.editMode ? this.editUserData.custId : this.isCoApplicant ? this.co_userid.cifId : this.userid.cifId;

    const permanentAddress = {
      addressType: 'PERMANENT',
      addressLine: form.value.addressline1,
      addressLine1: form.value.addressline2,
      addressLine2: form.value.addressline3,
      city: this.perselectedCityLabel,
      state: this.perselectedStateLabel,
      isPreferredAddress: this.isDifferentAddress == false ? 1 : 0,
      isMailingAddress: this.isDifferentAddress == false ? 1 : 0,
      zipCode: form.value.perpincode,
      country: 'India'
    };

    const currentAddress = {
      addressType: 'CURRENT',
      addressLine: form.value.addressline1,
      addressLine1: form.value.addressline2,
      addressLine2: form.value.addressline3,
      city: this.perselectedCityLabel,
      state: this.perselectedStateLabel,
      isPreferredAddress: this.isDifferentAddress == false ? 1 : 0,
      isMailingAddress: this.isDifferentAddress == false ? 1 : 0,
      zipCode: form.value.perpincode,
      country: 'India'
    };
    const otherAddress = {
      addressType: 'OTHER',
      addressLine: form.value.currentaddressline1,
      addressLine1: form.value.currentaddressline2,
      addressLine2: form.value.currentaddressline3,
      city: this.currselectedCityLabel,
      state: this.currselectedStateLabel,
      isPreferredAddress: this.isDifferentAddress == true ? 1 : 0,
      isMailingAddress: this.isDifferentAddress == true ? 1 : 0,
      zipCode: form.value.currpincode,
      country: 'India'
    };


    const kycPayload = {
      firstName: firstName,
      lastName: lastName,
      dob: form.value.dob ? form.value.dob.format('YYYY-MM-DD') : null,
      aadhaarNumber: form.value.aadharnum,
      panNumber: (form.value.pan).toUpperCase(),
      passportNo: form.value.Passport,
      addresses: this.isDifferentAddress
        ? [permanentAddress, currentAddress, otherAddress]
        : [permanentAddress, currentAddress]


    };
    console.log("fd-------", kycPayload)
    sessionStorage.setItem(
      'userdetails',
      JSON.stringify({
        ...kycPayload,
        dob: kycPayload.dob
      })
    );

    console.log("this.files----", this.files);

    const fd = new FormData();

    // text fields
    fd.append('kycData', JSON.stringify(kycPayload));
    if (this.files.pan) fd.append('panFile', this.files.pan);
    if (this.files.aadharfront) fd.append('aadharFrontFile', this.files.aadharfront);
    if (this.files.aadharback) fd.append('aadharBackFile', this.files.aadharback);
    if (this.files.passport) fd.append('passportFile', this.files.passport);
    fd.append('custId', custid);
    if (this.files.secaddress) {
      fd.append('utilityBillFile', this.files.secaddress);
    }



    this.addcustomerservice.uploadkycdocuments(fd).subscribe({
      next: res => {
        console.log("KYC uploaded", res);
        this.ncid.emit(res.ncId);
        this.kycid.emit(res.kycId);
        this.loanservice.setKycId(res.kycId);
          this.lastSavedPayload = this.normalizeKycPayload(kycPayload);
        // this.nextStep.emit();
        if (this.isCoApplicant) {
          this.stepperService.markStepCompleted('co-kyc');
          this.stepperService.setStepData('co-kyc', fd);
          this.stepperService.next();
        } else {
          this.nextStep.emit();
        }
      },
      error: err => {
        console.error(err);
      }
    });

    this.editMode = false;
  }
  kycupload(form: any) {
    console.log(form.value);

    if (!form.valid) {
      console.log("form invalid");
      return;
    }


    const kycPayload = this.buildKycPayload(form.value);
    let key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(kycPayload));
    this.lastSavedPayload = { ...kycPayload };


    sessionStorage.setItem(
      'userdetails',
      JSON.stringify({
        ...kycPayload,
        dob: kycPayload.dob
      })
    );

    console.log("this.files----", this.files);

    const fd = new FormData();


    // text fields
    fd.append('kycData', JSON.stringify({


      firstName: kycPayload.firstName,
      lastName: kycPayload.lastName,
      dob: kycPayload.dob,
      aadhaarNumber: kycPayload.aadhaarNumber,
      panNumber: kycPayload.panNumber,
      passportNo: kycPayload.passportNo,
      addresses: kycPayload.addresses

      // addresses: this.isDifferentAddress
      //   ? [permanentAddress, currentAddress, otherAddress]
      //   : [permanentAddress, currentAddress]



    }));
    if (this.files.pan) fd.append('panFile', this.files.pan);
    if (this.files.aadharfront) fd.append('aadharFrontFile', this.files.aadharfront);
    if (this.files.aadharback) fd.append('aadharBackFile', this.files.aadharback);
    if (this.files.passport) fd.append('passportFile', this.files.passport);
    fd.append('custId', kycPayload.custId);
    if (this.files.secaddress) {
      fd.append('utilityBillFile', this.files.secaddress);
    }



    this.addcustomerservice.uploadkycdocuments(fd).subscribe({
      next: res => {
        console.log("KYC uploaded", res);
        this.ncid.emit(res.ncId);
        this.kycid.emit(res.kycId);
        this.loanservice.setKycId(res.kycId);
          this.lastSavedPayload = this.normalizeKycPayload(kycPayload);
        // this.nextStep.emit();
        if (this.isCoApplicant) {
          this.issuccess = true;
          this.stepperService.markStepCompleted('co-kyc');
          this.stepperService.setStepData('co-kyc', kycPayload);
         
        } else {
          this.nextStep.emit();
        }
      },
      error: err => {
        console.error(err);
      }
    });

    this.editMode = false;
  }

  onFileChange1(result: UploadResult, key: string) {

    if (!result.file) {
      this.uploadedFiles[key] = null;
      return;
    }

    this.files[key] = result.file;
    this.uploadedFiles[key] = result.file;

  }

  onFileChange(result: UploadResult, key: string) {
    if (!result.file) {
      this.uploadedFiles[key] = null;

      if (this.uploadedPreviewUrls[key]) {
        URL.revokeObjectURL(this.uploadedPreviewUrls[key]);
        delete this.uploadedPreviewUrls[key];
      }

      delete this.files[key];
      delete this.uploadedFileMeta[key];
      return;
    }

    this.files[key] = result.file;
    this.uploadedFiles[key] = result.file;

    // Clear old preview URL if same key uploaded again
    if (this.uploadedPreviewUrls[key]) {
      URL.revokeObjectURL(this.uploadedPreviewUrls[key]);
    }


    const previewUrl = URL.createObjectURL(result.file);
    this.uploadedPreviewUrls[key] = previewUrl;

    this.uploadedFileMeta[key] = {
      fileName: result.file.name,
      fileUrl: previewUrl,
      uploaded: true,
      localOnly: true
    };

    if (this.kycForm) {
      const input = this.buildKycPayload(this.kycForm.value);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(input));
    }

  }

  get allRequiredFilesUploaded(): boolean {

    let docsToCheck = [...this.requiredDocs];

    if (this.addressType === 'different') {
      docsToCheck.push('secaddress');
    }

    return docsToCheck.every(k => !!this.uploadedFiles[k] || !!this.uploadedFileMeta[k]?.fileName);
  }

  permailcheck(event: any) {
    console.log("--permant", event);
    this.isPermanentMailingChecked = event;
    this.permanentMailingFlag = event ? 1 : 0;

    if (event) {
      this.isCurrentMailingChecked = false;
      this.currentMailingFlag = 0;
    }
  }
  currentmailcheck(event: any) {
    console.log("--current", event);
    // this.currentMailingFlag = event ? 1 : 0;

    this.isCurrentMailingChecked = event;
    this.currentMailingFlag = event ? 1 : 0;

    if (event) {
      this.isPermanentMailingChecked = false;
      this.permanentMailingFlag = 0;
    }

  }

  // Dropdown options
  secondaryaddproof = [
    { value: 'Electricitybill', label: 'Electricity Bill' },
    { value: 'gasbill', label: 'Gas Bill' },
    { value: 'mobilebill', label: 'Mobile Bill' },
    { value: 'rentalagreement', label: 'Rental Agreement' },
    { value: 'Bankpassbook', label: 'Bank Passbook' },
    { value: 'voterID', label: 'Voter ID' }
  ];

  onSelectionChange(value: any) {
    console.log('Selected:1', value);
  }



  states() {
    this.main.getIndianstates().subscribe((res: any) => {
      const list = res.data ?? res;

      this.stateOptions = list.map((s: any) => ({
        value: s.id,
        label: s.name
      }));

      this.currstateOptions = [...this.stateOptions];
    });
  }

  selectPerState(id: any) {

    const found = this.stateOptions.find(s => s.value === id);
    this.perselectedStateLabel = found?.label ?? '';

    this.perCitySelectedOption = null;
    this.perselectedCityId = '';
    this.perselectedCityLabel = '';

    this.cityOptions = [];
    this.loadPerCities(id);
  }

  loadPerCities(id: any) {
    this.main.getIndianstatescities(id).subscribe((res: any) => {
      const list = res.data ?? res;

      this.cityOptions = list.map((c: any) => ({
        value: c.id,
        label: c.name
      }));
    });
  }

  selectPerCity(id: any) {

    const found = this.cityOptions.find(c => c.value === id);
    this.perselectedCityLabel = found?.label ?? '';
  }

  selectCurrState(id: any) {
    const found = this.currstateOptions.find(s => s.value === id);
    this.currselectedStateLabel = found?.label ?? '';

    this.currCitySelectedOption = null;
    this.currselectedCityId = '';
    this.currselectedCityLabel = '';

    this.currcityOptions = [];

    this.loadCurrCities(id);
  }

  loadCurrCities(id: any) {
    this.main.getIndianstatescities(id).subscribe((res: any) => {
      const list = res.data ?? res;

      this.currcityOptions = list.map((c: any) => ({
        value: c.id,
        label: c.name
      }));
    });
  }

  selectCurrCity(id: any) {
    const found = this.currcityOptions.find(c => c.value === id);
    this.currselectedCityLabel = found?.label ?? '';
  }

  //file upload img to show preview
  hasLocalFile(key: string): boolean {
    return !!this.uploadedFiles[key] || !!this.uploadedFileMeta[key]?.fileName;;
  }

  getLocalFileName(key: string): string {
    return this.uploadedFiles[key]?.name || this.uploadedFileMeta[key]?.fileName || 'No file uploaded';
  }

  getLocalFileUrl(key: string): string {
    return this.uploadedPreviewUrls[key] || this.uploadedFileMeta[key]?.fileName || this.uploadedFileMeta[key]?.fileUrl || '';
  }

  viewLocalFile(key: string): void {
    const url = this.getLocalFileUrl(key);

    if (!url) return;

    window.open(url, '_blank');
  }

  downloadLocalFile(key: string): void {
    const file = this.uploadedFiles[key];
    const meta = this.uploadedFileMeta[key];
    if (!file) return;

    const url = this.getLocalFileUrl(key);
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name || meta?.fileName;
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
        delete this.uploadedFileMeta[key];
        if (this.kycForm) {
          const input = this.buildKycPayload(this.kycForm.value);
          localStorage.setItem(this.getStorageKey(), JSON.stringify(input));
        }

      }
    });
  }


  back() {
    this.stepperService.previous();
  }
  next() {

    if (!this.kycForm) {
      console.error('KYC form not found');
      return;
    }

    if (
      !this.kycForm.valid ||
      !this.allRequiredFilesUploaded ||
      !(this.isPermanentMailingChecked || this.isCurrentMailingChecked)
    ) {
      console.log('KYC form invalid');
      return;
    }

 const currentPayload = this.buildKycPayload(this.kycForm.value);

  const hasChanged = this.isKycPayloadChanged(
    currentPayload,
    this.lastSavedPayload
  );

    
const hasNewFiles = this.hasNewKycFiles();

  const stepRoute = this.isCoApplicant ? 'co-kyc' : 'kycinfo';

  //  No changes + no new files = skip API
  if (!hasChanged && !hasNewFiles) {
    console.log('No KYC changes detected, skipping API');

    this.stepperService.markStepCompleted(stepRoute);
    this.stepperService.setStepData(stepRoute, currentPayload);
    this.stepperService.next();

    return;
  }


    this.kycupload(this.kycForm);

  }
   handleSuccessAction() {
   this.stepperService.next();
  }
    onCancel() {
   this.issuccess = false;
  }
  buildKycPayload(formValue: any) {
    const firstName = this.editMode
      ? this.editUserData.fname
      : this.isCoApplicant
        ? this.co_userid?.fullName
        : this.userdata?.fname;

    const lastName = this.editMode
      ? this.editUserData.lname
      : this.isCoApplicant
        ? this.co_userid?.fullName
        : this.userdata?.lname;

    const custId = this.editMode
      ? this.editUserData.custId
      : this.isCoApplicant
        ? this.co_userid?.cifId
        : this.userid?.cifId;

    const permanentAddress = {
      addressType: 'PERMANENT',
      addressLine: formValue.addressline1 || '',
      addressLine1: formValue.addressline2 || '',
      addressLine2: formValue.addressline3 || '',
      city: this.perselectedCityLabel || '',
      // cityId: this.perselectedCityId || this.perCitySelectedOption || '',
      state: this.perselectedStateLabel || '',
      // stateId: this.perselectedStateId || this.perStateSelectedOption || '',
      isPreferredAddress: this.isDifferentAddress === false ? 1 : 0,
      isMailingAddress: this.isDifferentAddress ? 1 : 0,
      zipCode: formValue.perpincode || '',
      country: 'India'
    };


    const currentAddress = {
      addressType: 'CURRENT',
      addressLine: formValue.addressline1 || '',
      addressLine1: formValue.addressline2 || '',
      addressLine2: formValue.addressline3 || '',
      city: this.perselectedCityLabel || '',
      // cityId: this.perselectedCityId || this.perCitySelectedOption || '',
      state: this.perselectedStateLabel || '',
      // stateId: this.perselectedStateId || this.perStateSelectedOption || '',
      isPreferredAddress: this.isDifferentAddress == false ? 1 : 0,
      isMailingAddress: this.isDifferentAddress == false ? 1 : 0,
      zipCode: formValue.perpincode || '',
      country: 'India'
    };


    const otherAddress = {
      addressType: 'OTHER',
      addressLine: formValue.currentaddressline1 || '',
      addressLine1: formValue.currentaddressline2 || '',
      addressLine2: formValue.currentaddressline3 || '',
      city: this.currselectedCityLabel,
      // cityId: this.currselectedCityId || this.currCitySelectedOption || '',
      state: this.currselectedStateLabel,
      // stateId: this.currselectedStateId || this.currStateSelectedOption || '',
      isPreferredAddress: this.isDifferentAddress == true ? 1 : 0,
      isMailingAddress: this.isDifferentAddress == true ? 1 : 0,
      zipCode: formValue.currpincode || '',
      country: 'India'
    };


    return {
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      custId: custId,

      firstName: firstName || '',
      lastName: lastName || '',

      dob: formValue.dob
        ? moment.isMoment(formValue.dob)
          ? formValue.dob.format('YYYY-MM-DD')
          : moment(formValue.dob).format('YYYY-MM-DD')
        : null,

      aadhaarNumber: formValue.aadharnum || '',
      panNumber: formValue.pan ? formValue.pan.toUpperCase() : '',
      passportNo: formValue.Passport || '',

      addressType: this.addressType,
      isDifferentAddress: this.isDifferentAddress,
      isPermanentMailingChecked: this.isPermanentMailingChecked,
      isCurrentMailingChecked: this.isCurrentMailingChecked,

      selectedSecondaryProof: this.selectedSecondaryProof,

      addresses: this.isDifferentAddress
        ? [permanentAddress, currentAddress, otherAddress]
        : [permanentAddress, currentAddress],

      // fileMeta: {
      //   pan: this.uploadedFiles['pan']?.name || '',
      //   aadharfront: this.uploadedFiles['aadharfront']?.name || '',
      //   aadharback: this.uploadedFiles['aadharback']?.name || '',
      //   passport: this.uploadedFiles['passport']?.name || '',
      //   secaddress: this.uploadedFiles['secaddress']?.name || ''
      // }

      fileMeta: {
        pan: this.uploadedFileMeta['pan'] || {
          fileName: this.uploadedFiles['pan']?.name || '',
          fileUrl: this.uploadedPreviewUrls['pan'] || '',
          uploaded: !!this.uploadedFiles['pan']
        },

        aadharfront: this.uploadedFileMeta['aadharfront'] || {
          fileName: this.uploadedFiles['aadharfront']?.name || '',
          fileUrl: this.uploadedPreviewUrls['aadharfront'] || '',
          uploaded: !!this.uploadedFiles['aadharfront']
        },

        aadharback: this.uploadedFileMeta['aadharback'] || {
          fileName: this.uploadedFiles['aadharback']?.name || '',
          fileUrl: this.uploadedPreviewUrls['aadharback'] || '',
          uploaded: !!this.uploadedFiles['aadharback']
        },

        passport: this.uploadedFileMeta['passport'] || {
          fileName: this.uploadedFiles['passport']?.name || '',
          fileUrl: this.uploadedPreviewUrls['passport'] || '',
          uploaded: !!this.uploadedFiles['passport']
        },

        secaddress: this.uploadedFileMeta['secaddress'] || {
          fileName: this.uploadedFiles['secaddress']?.name || '',
          fileUrl: this.uploadedPreviewUrls['secaddress'] || '',
          uploaded: !!this.uploadedFiles['secaddress']
        }
      }

    };
  }


  saveExit() {

    if (!this.kycForm) {
      console.error('KYC form not found');
      return;
    }

    const formValue = this.kycForm.value;

    const input = this.buildKycPayload(formValue);

    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(input));

    
const hasChanged = this.isKycPayloadChanged(input, this.lastSavedPayload);
  const hasNewFiles = this.hasNewKycFiles();

  // ✅ If no changes, don't call save API
  if (!hasChanged && !hasNewFiles) {
    console.log('No KYC changes detected, skipping save-exit API');
    return;
  }

    const inputdata = {
      action: "auto-save",
      sectionKey: "KYC",
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      jsonData: input
    };

    this.loanservice.saveandExit(inputdata).subscribe({
      next: () => {
        this.lastSavedPayload = { ...input };
      },
      error: (err) => {
        console.error('KYC save and exit failed', err);
      }

    });
  }
  getSavedKycInfo(): Promise<any> {
    let sectionkey = "KYC"
    return new Promise((resolve) => {
      this.loanservice.getSavedData(this.applicationId, this.applicantId, sectionkey).pipe()

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
  async restoreKycData() {
    const key = this.getStorageKey();

    const localData = localStorage.getItem(key);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    const apiData = await this.getSavedKycInfo();

    let finalData = null;

    if (apiData) {
      finalData = apiData;
      localStorage.setItem(key, JSON.stringify(apiData));
    } else if (parsedLocal) {
      finalData = parsedLocal;
    }

    if (!finalData) {
      this.lastSavedPayload = null;
      return;
    }

    setTimeout(() => {
      this.patchKycInfo(finalData);
      this.lastSavedPayload = this.normalizeKycPayload(finalData);


      if (this.isCoApplicant) {
        this.stepperService.markStepCompleted('co-kyc');
      }

    }, 0);
  }

  // edit flow = patch from summary
  patchFromSummary() {
    if (!this.isCoApplicant) return;
    if (!this.loanservice.isEditFlow()) return;

    const data = this.loanservice.getSummarySection('kyc');
    console.log('patch kyc', data);

    if (!data || !this.kycForm) return;

    const identity = data.identityAndResidency || {};
    const permanent = data.permanentAddress || {};
    const current = data.currentAddress || {};
    const other = data.otherAddress || null;

    const findStateId = (stateName: string) =>
      this.stateOptions.find(s =>
        s.label?.toLowerCase() === stateName?.toLowerCase()
      )?.value || '';

    const permanentStateId = findStateId(permanent.state);
    const currentStateId = findStateId(other?.state || current.state);

    const isDifferent = !!other;

    const mappedData = {
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      custId: this.isCoApplicant
        ? this.co_userid?.cifId
        : this.userid?.cifId,

      firstName: this.isCoApplicant
        ? this.co_userid?.fullName
        : this.userdata?.fname,

      lastName: this.isCoApplicant
        ? this.co_userid?.fullName
        : this.userdata?.lname,

      dob: identity.dob
        ? moment(identity.dob, 'DD/MM/YYYY').format('YYYY-MM-DD')
        : null,

      aadhaarNumber: identity.aadhaarNumber || '',
      panNumber: identity.panNumber || '',
      passportNo: identity.passportNumber || '',

      addressType: isDifferent ? 'different' : 'same',
      isDifferentAddress: isDifferent,

      isPermanentMailingChecked:
        permanent.isMailingAddress === 1 || !isDifferent,

      isCurrentMailingChecked:
        isDifferent
          ? other?.isMailingAddress === 1
          : current.isMailingAddress === 1,

      selectedSecondaryProof: null,

      addresses: [
        {
          addressType: 'PERMANENT',
          addressLine: permanent.addressLine || '',
          addressLine1: permanent.addressLine1 || '',
          addressLine2: permanent.addressLine2 || '',
          city: permanent.city || '',
          cityId: '',
          state: permanent.state || '',
          stateId: permanentStateId,
          isPreferredAddress: permanent.isPreferredAddress ?? 1,
          isMailingAddress: permanent.isMailingAddress ?? 1,
          zipCode: permanent.pincode || '',
          country: permanent.country || 'India'
        },
        {
          addressType: 'CURRENT',
          addressLine: current.addressLine || '',
          addressLine1: current.addressLine1 || '',
          addressLine2: current.addressLine2 || '',
          city: current.city || '',
          cityId: '',
          state: current.state || '',
          stateId: findStateId(current.state),
          isPreferredAddress: current.isPreferredAddress ?? 0,
          isMailingAddress: current.isMailingAddress ?? 0,
          zipCode: current.pincode || '',
          country: current.country || 'India'
        },

        ...(isDifferent ? [{
          addressType: 'OTHER',
          addressLine: other.addressLine || '',
          addressLine1: other.addressLine1 || '',
          addressLine2: other.addressLine2 || '',
          city: other.city || '',
          cityId: '',
          state: other.state || '',
          stateId: currentStateId,
          isPreferredAddress: other.isPreferredAddress ?? 1,
          isMailingAddress: other.isMailingAddress ?? 1,
          zipCode: other.pincode || '',
          country: other.country || 'India'
        }] : [])
      ],

      fileMeta: {
        aadharfront: {
          fileName: identity.aadhaarFrontUrl || '',
          fileUrl: identity.aadhaarFrontUrl || '',
          uploaded: !!identity.aadhaarFrontUrl
        },
        aadharback: {
          fileName: identity.aadhaarBackUrl || '',
          fileUrl: identity.aadhaarBackUrl || '',
          uploaded: !!identity.aadhaarBackUrl
        },
        pan: {
          fileName: identity.panCardUrl || '',
          fileUrl: identity.panCardUrl || '',
          uploaded: !!identity.panCardUrl
        },
        passport: {
          fileName: identity.passportUrl || '',
          fileUrl: identity.passportUrl || '',
          uploaded: !!identity.passportUrl
        },
        secaddress: {
          fileName:
            other?.supportingDocumentUrl ||
            current?.supportingDocumentUrl ||
            permanent?.supportingDocumentUrl ||
            '',
          fileUrl:
            other?.supportingDocumentUrl ||
            current?.supportingDocumentUrl ||
            permanent?.supportingDocumentUrl ||
            '',
          uploaded: !!(
            other?.supportingDocumentUrl ||
            current?.supportingDocumentUrl ||
            permanent?.supportingDocumentUrl
          )
        }
      }
    };

    this.patchKycInfo(mappedData);

    // set city id after state-wise city API loads
    if (permanentStateId && permanent.city) {
      this.main.getIndianstatescities(permanentStateId).subscribe((res: any) => {
        const list = res.data ?? res;

        this.cityOptions = list.map((c: any) => ({
          value: c.id,
          label: c.name
        }));

        const cityId =
          this.cityOptions.find(c =>
            c.label?.toLowerCase() === permanent.city?.toLowerCase()
          )?.value || '';

        this.perCitySelectedOption = cityId;
        this.perselectedCityId = cityId;
        this.perselectedCityLabel = permanent.city;
      });
    }

    if (isDifferent && currentStateId && other?.city) {
      this.main.getIndianstatescities(currentStateId).subscribe((res: any) => {
        const list = res.data ?? res;

        this.currcityOptions = list.map((c: any) => ({
          value: c.id,
          label: c.name
        }));

        const cityId =
          this.currcityOptions.find(c =>
            c.label?.toLowerCase() === other.city?.toLowerCase()
          )?.value || '';

        this.currCitySelectedOption = cityId;
        this.currselectedCityId = cityId;
        this.currselectedCityLabel = other.city;
      });
    }

    this.lastSavedPayload = this.normalizeKycPayload(mappedData);

    const stepRoute = this.isCoApplicant ? 'co-kyc' : 'kycinfo';
    this.stepperService.markStepCompleted(stepRoute);
  }

  patchKycInfo(data: any) {
    if (!data || !this.kycForm) return;

    const permanentAddress = data.addresses?.find(
      (a: any) => a.addressType === 'PERMANENT'
    );

    const otherAddress = data.addresses?.find(
      (a: any) => a.addressType === 'OTHER'
    );

    this.addressType = data.addressType || 'same';
    this.isDifferentAddress = !!data.isDifferentAddress;

    this.isPermanentMailingChecked =
      data.isPermanentMailingChecked ?? !this.isDifferentAddress;

    this.isCurrentMailingChecked =
      data.isCurrentMailingChecked ?? this.isDifferentAddress;

    this.selectedSecondaryProof = data.selectedSecondaryProof || null;

    this.perStateSelectedOption = permanentAddress?.stateId || '';
    this.perCitySelectedOption = permanentAddress?.cityId || '';

    this.perselectedStateId = permanentAddress?.stateId || '';
    this.perselectedCityId = permanentAddress?.cityId || '';
    this.perselectedStateLabel = permanentAddress?.state || '';
    this.perselectedCityLabel = permanentAddress?.city || '';

    this.currStateSelectedOption = otherAddress?.stateId || '';
    this.currCitySelectedOption = otherAddress?.cityId || '';

    this.currselectedStateId = otherAddress?.stateId || '';
    this.currselectedCityId = otherAddress?.cityId || '';
    this.currselectedStateLabel = otherAddress?.state || '';
    this.currselectedCityLabel = otherAddress?.city || '';

    this.kycForm.form.patchValue({
      dob: data.dob ? moment(data.dob, 'YYYY-MM-DD') : null,
      aadharnum: data.aadhaarNumber || '',
      pan: data.panNumber || '',
      Passport: data.passportNo || '',

      addressline1: permanentAddress?.addressLine || '',
      addressline2: permanentAddress?.addressLine1 || '',
      addressline3: permanentAddress?.addressLine2 || '',
      perpincode: permanentAddress?.zipCode || '',

      currentaddressline1: otherAddress?.addressLine || '',
      currentaddressline2: otherAddress?.addressLine1 || '',
      currentaddressline3: otherAddress?.addressLine2 || '',
      currpincode: otherAddress?.zipCode || ''
    });

    if (this.perselectedStateId) {
      this.loadPerCities(this.perselectedStateId);
    }

    if (this.currselectedStateId) {
      this.loadCurrCities(this.currselectedStateId);
    }
    if (data.fileMeta) {
      this.uploadedFileMeta = data.fileMeta;

      Object.keys(data.fileMeta).forEach(key => {
        const file = data.fileMeta[key];

        if (file?.fileName) {
          this.uploadedFiles[key] = null;
          this.uploadedPreviewUrls[key] = file.fileUrl || '';
        }
      });
    }
  }

  private normalizeKycPayload(payload: any) {
  if (!payload) return null;

  return {
    applicationId: payload.applicationId || '',
    applicantId: payload.applicantId || '',
    custId: payload.custId || '',

    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    dob: payload.dob || '',
    aadhaarNumber: payload.aadhaarNumber || '',
    panNumber: payload.panNumber || '',
    passportNo: payload.passportNo || '',

    addressType: payload.addressType || '',
    isDifferentAddress: !!payload.isDifferentAddress,
    isPermanentMailingChecked: !!payload.isPermanentMailingChecked,
    isCurrentMailingChecked: !!payload.isCurrentMailingChecked,
    selectedSecondaryProof: payload.selectedSecondaryProof || null,

    addresses: (payload.addresses || []).map((a: any) => ({
      addressType: a.addressType || '',
      addressLine: a.addressLine || '',
      addressLine1: a.addressLine1 || '',
      addressLine2: a.addressLine2 || '',
      city: a.city || '',
      state: a.state || '',
      zipCode: a.zipCode || '',
      country: a.country || 'India',
      isPreferredAddress: Number(a.isPreferredAddress || 0),
      isMailingAddress: Number(a.isMailingAddress || 0)
    })),

    // compare only filename, not blob URL
    fileMeta: {
      pan: payload.fileMeta?.pan?.fileName || '',
      aadharfront: payload.fileMeta?.aadharfront?.fileName || '',
      aadharback: payload.fileMeta?.aadharback?.fileName || '',
      passport: payload.fileMeta?.passport?.fileName || '',
      secaddress: payload.fileMeta?.secaddress?.fileName || ''
    }
  };
}

private isKycPayloadChanged(current: any, saved: any): boolean {
  return JSON.stringify(this.normalizeKycPayload(current)) !==
         JSON.stringify(this.normalizeKycPayload(saved));
}

private hasNewKycFiles(): boolean {
  return Object.values(this.files || {}).some(file => !!file);
}

  ngOnDestroy(): void {
    sessionStorage.removeItem('kycs');

    Object.values(this.uploadedPreviewUrls).forEach(url => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });

  }

}
