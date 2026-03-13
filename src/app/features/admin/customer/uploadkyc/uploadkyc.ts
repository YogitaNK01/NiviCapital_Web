import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Main } from '../../../../core/service/main';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Uploadbtn, UploadConfig, UploadResult } from "../../../systemdesign/uploadbtn/uploadbtn";
import { Datepickernew } from "../../../systemdesign/datepickernew/datepickernew";
import { Dropdown } from "../../../systemdesign/dropdown/dropdown";
import { Checkbox } from "../../../systemdesign/checkbox/checkbox";
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import moment from 'moment';


interface OptionItem {
  label: string;
  value: string;
}
@Component({
  selector: 'app-uploadkyc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Inputfield, Uploadbtn, Datepickernew, Dropdown, Checkbox, Buttons],
  templateUrl: './uploadkyc.html',
  styleUrl: './uploadkyc.scss'
})
export class Uploadkyc implements OnDestroy {
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
  optionalDocs = ['passport', 'bill',];

  uploadedFiles: Record<string, File | null> = {};


  // dob: any;
  selectstate_: any;
  selectcity_: any;
  userdata: any;
  userid: any;

  editMode = false;
  editUserData: any = {};
  dobValid = false;
  dobTouched = false;
  constructor(public main: Main, private addcustomerservice: Addcustomerservice, private route: ActivatedRoute, private loanservice: Loanformservice) { }

  ngOnInit(): void {
    this.states();
    const cifDetails = sessionStorage.getItem('cifdetails');
    this.userid = this.safeParse(cifDetails);

    const userDetails = sessionStorage.getItem('userdetails');
    this.userdata = this.safeParse(userDetails);

    const editUser = sessionStorage.getItem('editUser');

    if (editUser) {
      this.editMode = true;
      this.editUserData = JSON.parse(editUser);
    }
    this.requiredDocs.forEach(k => this.uploadedFiles[k] = null);
    this.optionalDocs.forEach(k => this.uploadedFiles[k] = null);

  }



  goToDashboard() {
    this.prevstep.emit();
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
    this.isDifferentAddress = true;

    this.isCurrentMailingChecked = true;
    this.isPermanentMailingChecked = false;
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
  kycupload(form: any) {
    console.log(form.value);


    if (!form.valid) {
      console.log("form invalid");
      return;
    }
    const firstName = this.editMode ? this.editUserData.fname : this.userdata.fname;

    const lastName = this.editMode ? this.editUserData.lname : this.userdata.lname;

    const custid = this.editMode ? this.editUserData.custId : this.userid.cifId;

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
        this.nextStep.emit();
      },
      error: err => {
        console.error(err);
      }
    });

    this.editMode = false;
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

    if (this.addressType === 'different') {
      docsToCheck.push('secaddress');
    }

    return docsToCheck.every(k => !!this.uploadedFiles[k]);
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

  ngOnDestroy(): void {
    sessionStorage.removeItem('kycs');
  }

}
