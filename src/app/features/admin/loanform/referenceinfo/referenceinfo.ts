import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import * as bootstrap from 'bootstrap';
import { Dropdown } from '../../../systemdesign/dropdown/dropdown';
import { Successbox } from '../../customer/successbox/successbox';



interface OptionItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-referenceinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Inputfield, Checkbox, FormsModule, Dropdown, Successbox],
  templateUrl: './referenceinfo.html',
  styleUrl: './referenceinfo.scss'
})
export class Referenceinfo implements OnInit {

  openIndex: number[] = [0];
  accordions = [
    { title: 'Reference 1', alwaysOpen: true },
    { title: 'Reference 2', alwaysOpen: false },
  ];
  referenceForm!: FormGroup

  isdata: boolean = false;

  private mobileSubject = new Subject<string>();
  ismiddlename: boolean[] = [false, false];

  perStateSelectedOption: any;
  perCitySelectedOption: any;

  selectedStateId: string[] = ['', ''];
  selectedCityId: string[] = ['', ''];


  stateOptions: OptionItem[] = [];
  cityOptions: OptionItem[] = [];

  perselectedStateId!: string;
  perselectedStateLabel!: string;

  perselectedCityId!: string;
  perselectedCityLabel!: string;

  perselectedStateLabelArr: string[] = ['', ''];
  perselectedCityLabelArr: string[] = ['', ''];

  // mobileNumber:any;
  popupStep = 1;
  currentRefIndex = 0;
  mobileNumber = '';
  private modalInstance: bootstrap.Modal | null = null;


  reference1Filled = false;
  reference2Filled = false;
  isSearchDone = false;

  applicantId: any;
  applicationId: any;

  showmiddlenameError = false;
  submitAttempted = false;
  reference1Touched = false;
  reference2Touched = false;

  savedReferenceData: any[] = [{}, {}];
  firstPhoneEnteredRef: 1 | 2 | null = null;
  private successModalInstance: bootstrap.Modal | null = null;
  @ViewChild('phone') phone!: any;

  isCoApplicant: boolean = false;
  lastSavedPayload: any = null;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }
  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });


    this.referenceForm = this.fb.group({
      reference1: this.fb.array([this.createReferenceGroup()]),
      reference2: this.fb.array([this.createReferenceGroup()])
    },

      {
        validators: this.referenceUniquenessValidator
      }
    )


    //     const key = `referenceinfoData_main${this.applicantId}`;
    // const storedData = localStorage.getItem(key);

    // if (!this.loanformservice.referenceInfoData && storedData) {
    //   this.loanformservice.referenceInfoData = JSON.parse(storedData);
    // }

    // if (this.loanformservice.referenceInfoData) {
    //   this.patchReferenceData();

    //   this.reference1Filled = this.loanformservice.referenceInfoData.reference1Filled || false;
    //   this.reference2Filled = this.loanformservice.referenceInfoData.reference2Filled || false;

    //   this.stepperService.markStepCompleted('referenceinfo');
    // }


    const key = this.getStorageKey();
    const localData = localStorage.getItem(key);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    const apiData = await this.getSavedReferenceInfo();

    let finalData = null;

    if (apiData) {
      finalData = apiData;
      localStorage.setItem(key, JSON.stringify(apiData));
    } else if (parsedLocal) {
      finalData = parsedLocal;
    }

    if (finalData) {
      this.loanformservice.referenceInfoData = finalData;
      this.patchReferenceData();

      this.reference1Filled = finalData.reference1Filled || false;
      this.reference2Filled = finalData.reference2Filled || false;

      this.lastSavedPayload = this.buildReferencePayload();

      this.stepperService.markStepCompleted('referenceinfo');
    }


    this.states()
  }
  getStorageKey() {
    return this.isCoApplicant
      ? `referenceinfoData_coapp${this.applicantId}`
      : `referenceinfoData_main${this.applicantId}`;
  }

  get f() {
    return this.referenceForm.controls;
  }
  get reference1Array(): FormArray {
    return this.referenceForm.get('reference1') as FormArray;
  }

  get reference2Array(): FormArray {
    return this.referenceForm.get('reference2') as FormArray;
  }
  getRefControl(type: string, i: number, control: string) {
    return (this.referenceForm.get(type) as FormArray).at(i).get(control);
  }

  getRefControl1(type: string, i: number, control: string) {
    const array = this.referenceForm.get(type) as FormArray;
    if (!array || !array.at(i)) return null;
    return array.at(i).get(control);
  }

  onMobileInput(event: any) {
    const value = event.target.value;
    this.mobileSubject.next(value);
  }
  onmiddlename(value: boolean) {
    this.ismiddlename[this.currentRefIndex] = value;

    const array = this.currentRefIndex === 0 ? this.reference1Array : this.reference2Array;
    const mnameCtrl = array.at(0).get('mname');

    if (value) {
      // Checkbox is checked: Clear and disable the control
      mnameCtrl?.setValue('');
      mnameCtrl?.clearValidators();
      mnameCtrl?.updateValueAndValidity();
      mnameCtrl?.disable();
    } else {
      // Checkbox unchecked: Enable and require it again
      mnameCtrl?.enable();
      mnameCtrl?.setValidators([Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]);
      mnameCtrl?.updateValueAndValidity();
    }
  }
  onmiddlename1(value: boolean) {
    this.ismiddlename[this.currentRefIndex] = value;

    const array =
      this.currentRefIndex === 0
        ? this.reference1Array
        : this.reference2Array;

    const mnameCtrl = array.at(0).get('mname');

    if (value) {
      mnameCtrl?.reset();
      mnameCtrl?.disable();
    } else {
      mnameCtrl?.enable();
    }
  }
  searchMobile(mobile: string) {
    this.mobileNumber = mobile;
    let input = {
      identifier: mobile,
      type: "MOBILE",
        "applicantType": "PRIMARY", //// PRIMARY / CO_APPLICANT
      "coApplicantIndex": 0,

    }

    this.apiservice.customersearch(input).subscribe(res => {

      const isExisting = res.message?.includes('Existing customer found');

      this.isdata = !isExisting;

      const currentArray =
        this.currentRefIndex === 0 ? this.reference1Array : this.reference2Array;

      if (currentArray.length === 0) {
        currentArray.push(this.createReferenceGroup());
      }

      currentArray.at(0).patchValue({
        phone: mobile,
        ...(isExisting ? res.data[0] : {})
      });

      this.isSearchDone = true;
      // this.popupStep = 2;
    });

  }

  goNext() {
    this.popupStep = 2;
  }

  createReferenceGroup(): FormGroup {
    return this.fb.group({
      fname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      mname: ['', [Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      lname: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'), Validators.minLength(2), Validators.maxLength(25)]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'), Validators.minLength(10), Validators.maxLength(40)]],
      peraddressline1: ['', [Validators.minLength(2), Validators.maxLength(255)]],
      peraddressline2: ['', [Validators.minLength(2), Validators.maxLength(255)]],
      peraddressline3: ['', [Validators.minLength(2), Validators.maxLength(255)]],
      percountry: ['India'],
      perstate: ['',],
      percity: ['',],
      perpincode: ['', [Validators.minLength(6), Validators.maxLength(6), this.invalidPincodeValidator]],
      phone: ['', Validators.required]
    });
  }

  addReference(type: 'reference1' | 'reference2') {
    (this.referenceForm.get(type) as FormArray).push(this.createReferenceGroup());
  }

  removeReference(type: 'reference1' | 'reference2', index: number) {
    (this.referenceForm.get(type) as FormArray).removeAt(index);
  }


  states() {
    this.main.getIndianstates().subscribe((res: any) => {
      const list = res.data ?? res;

      this.stateOptions = list.map((s: any) => ({
        value: s.id,
        label: s.name
      }));

    });
  }

  selectPerState(id: any) {


    const refIndex = this.currentRefIndex;

    this.selectedStateId[refIndex] = id;
    this.selectedCityId[refIndex] = '';


    const found = this.stateOptions.find(s => s.value === id);
    this.perselectedStateId = found?.value ?? ''
    this.perselectedStateLabel = found?.label ?? '';


    this.perselectedStateLabelArr[refIndex] = found?.label ?? '';

    // reset city for this form only
    this.perselectedCityLabelArr[refIndex] = '';


    const array =
      this.currentRefIndex === 0
        ? this.reference1Array
        : this.reference2Array;

    array.at(0).patchValue({
      perstate: this.perselectedStateId
    });


    this.perCitySelectedOption = null;
    this.perselectedCityId = '';
    this.perselectedCityLabel = '';
    this.cityOptions = [];
    this.loadPerCities(id);
  }

  loadPerCities(id: any, refIndex?: number) {
    this.main.getIndianstatescities(id).subscribe((res: any) => {
      const list = res.data ?? res;

      this.cityOptions = list.map((c: any) => ({
        value: c.id,
        label: c.name
      }));


      if (refIndex !== undefined) {
        const array =
          refIndex === 0 ? this.reference1Array : this.reference2Array;

        this.selectedCityId[refIndex] =
          array.at(0).value.percity || '';
      }

    });
  }

  selectPerCity(id: any) {


    const refIndex = this.currentRefIndex;

    this.selectedCityId[refIndex] = id;


    const found = this.cityOptions.find(c => c.value === id);
    this.perselectedCityId = found?.value ?? ''

    this.perselectedCityLabel = found?.label ?? '';

    this.perselectedCityLabelArr[this.currentRefIndex] = found?.label ?? '';



    const array =
      this.currentRefIndex === 0
        ? this.reference1Array
        : this.reference2Array;

    array.at(0).patchValue({
      percity: this.perselectedCityId
    });


  }


  invalidPincodeValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === '000000') {
      return { invalidPincode: true };
    }
    return null;
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
  }



  patchReferenceData() {
    const data = this.loanformservice.referenceInfoData;
    if (!data) return;

    // ✅ clear first
    this.reference1Array.clear();
    this.reference2Array.clear();

    // ---------------- REFERENCE 1 ----------------
    if (data.reference1?.length) {
      data.reference1.forEach((item: any) => {
        const group = this.createReferenceGroup();
        group.patchValue(item);
        this.reference1Array.push(group);
      });
    } else {
      this.reference1Array.push(this.createReferenceGroup());
    }

    // ---------------- REFERENCE 2 ----------------
    if (data.reference2?.length) {
      data.reference2.forEach((item: any) => {
        const group = this.createReferenceGroup();
        group.patchValue(item);
        this.reference2Array.push(group);
      });
    } else {
      this.reference2Array.push(this.createReferenceGroup());
    }

    this.cd.detectChanges();
  }
  onEmailChange() {

    if (this.currentRefIndex === 1) {
      this.reference2Touched = true;
    }
    if (this.currentRefIndex === 0) {
      this.reference1Touched = true;
    }
    this.referenceForm.updateValueAndValidity({ emitEvent: true });

  }
  onMobileChange(value: string) {
    this.mobileNumber = value;
    if (this.currentRefIndex === 1) {
      this.reference2Touched = true;

      if (!this.firstPhoneEnteredRef && value.length === 10) {
        this.firstPhoneEnteredRef = 2;
      }

    }
    if (this.currentRefIndex === 0) {
      this.reference1Touched = true;

      if (!this.firstPhoneEnteredRef && value.length === 10) {
        this.firstPhoneEnteredRef = 1;
      }

    }
    const array =
      this.currentRefIndex === 0
        ? this.reference1Array
        : this.reference2Array;

    const phoneCtrl = array.at(0).get('phone');

    if (phoneCtrl) {
      phoneCtrl.setValue(value);
      phoneCtrl.markAsTouched();
      phoneCtrl.updateValueAndValidity({ emitEvent: true });
    }

    this.referenceForm.updateValueAndValidity({ emitEvent: true });
  }

  referenceUniquenessValidator1: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {

    const ref1 = control.get('reference1') as FormArray;
    const ref2 = control.get('reference2') as FormArray;

    if (!ref1?.length || !ref2?.length) return null;

    const r1 = ref1.at(0);
    const r2 = ref2.at(0);

    const phone1 = r1.get('phone')?.value;
    const phone2 = r2.get('phone')?.value;
    const email1 = r1.get('email')?.value;
    const email2 = r2.get('email')?.value;

    const errors: any = {};

    if (phone1 && phone2 && phone1 === phone2) {
      errors.samePhone = true;
    }

    if (
      email1 && email2 &&
      email1.trim().toLowerCase() === email2.trim().toLowerCase()
    ) {
      errors.sameEmail = true;
    }

    return Object.keys(errors).length ? errors : null;
  };

  referenceUniquenessValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const ref1 = control.get('reference1') as FormArray;
    const ref2 = control.get('reference2') as FormArray;

    if (!ref1?.length || !ref2?.length) return null;
    const errors: any = {};
    const r1 = ref1.at(0);
    const r2 = ref2.at(0);

    const phone1 = r1.get('phone')?.value;
    const phone2 = r2.get('phone')?.value;
    const emailCtrl1 = r1.get('email');
    const emailCtrl2 = r2.get('email');

    const email1 = emailCtrl1?.value?.trim().toLowerCase();
    const email2 = emailCtrl2?.value?.trim().toLowerCase();

    // emailCtrl1?.setErrors(null);
    // emailCtrl2?.setErrors(null);

    if (phone1 && phone2 && phone1 === phone2) {
      errors.samePhone = true;
    }


    if (email1 && email2 && email1 === email2) {
      // errors.sameEmail = true;

      this.setMergedError(emailCtrl1, { sameEmail: true });
      this.setMergedError(emailCtrl2, { sameEmail: true });
      return { sameEmail: true };

    }

    return Object.keys(errors).length ? errors : null;


  };
  setMergedError = (ctrl: AbstractControl | null, error: any) => {
    if (!ctrl) return;
    const existingErrors = ctrl.errors || {};
    ctrl.setErrors(Object.keys(existingErrors).length || error ? {
      ...existingErrors,
      ...error
    } : null);
  };



  // ==================== OPEN MODAL ====================
  openModal(index: number = 0) {
    this.currentRefIndex = index;
    if (this.phone) {
      this.phone.resetForm?.();
      this.phone.control?.markAsPristine();
      this.phone.control?.markAsUntouched();
    }
    this.mobileNumber = '';
    this.submitAttempted = false;
    if (index === 1) {
      this.reference2Touched = false;
      // this.ismiddlename[1] = false;
    }





    const isAlreadySaved =
      index === 0 ? this.reference1Filled : this.reference2Filled;

    const currentArray =
      index === 0 ? this.reference1Array : this.reference2Array;

    if (isAlreadySaved && currentArray.at(0)?.value?.phone) {
      this.popupStep = 2;
      this.isSearchDone = true;
      this.mobileNumber = currentArray.at(0).value.phone;


      this.selectedStateId[index] = currentArray.at(0).value.perstate || '';
      this.selectedCityId[index] = '';

      this.perStateSelectedOption = this.selectedStateId[index];

      if (this.selectedStateId[index]) {
        this.loadPerCities(this.selectedStateId[index], index);

        setTimeout(() => {
          this.perCitySelectedOption = this.selectedCityId[index];
        }, 300);
      }

    } else {
      this.popupStep = 1;
      this.mobileNumber = '';
      this.isSearchDone = false;
    }

    this.isdata = false;


    setTimeout(() => {
      const modalElement = document.getElementById('referenceModal');
      if (modalElement) {
        this.modalInstance = new bootstrap.Modal(modalElement, {
          backdrop: 'static',
          keyboard: false
        });
        this.modalInstance.show();
      }
    }, 100);
  }

  // ==================== SEARCH BUTTON ====================
  searchReference() {
    if (this.mobileNumber.length !== 10) {
      return;
    }
    this.searchMobile(this.mobileNumber);
  }

  // ==================== BACK TO MOBILE STEP ====================
  backToMobileStep() {
    this.popupStep = 1;
  }

  // ==================== SAVE REFERENCE ====================
  saveReference() {
    this.submitAttempted = true;
    const isRef1 = this.currentRefIndex === 0;
    const currentArray = isRef1
      ? this.reference1Array
      : this.reference2Array;

    const group = currentArray.at(0);
    const middleNameOk =
      this.ismiddlename[this.currentRefIndex] ||
      !!group.get('mname')?.value;

    if (!middleNameOk) {
      group.get('mname')?.markAsTouched();
      return;
    }
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }

    currentArray.at(0).patchValue({
      phone: this.mobileNumber,

    });

    if (!this.canSaveReference) {
      currentArray.at(0).markAllAsTouched();
      return;
    }

    this.savedReferenceData[this.currentRefIndex] = JSON.parse(JSON.stringify(currentArray.at(0).value));

    console.log(`Reference  Saved:`, currentArray.at(0).value);
    const custID = localStorage.getItem('custId')
    const refForm = currentArray.at(0).value;

    const input = {
      reference: {
        referenceType: isRef1 ? 'reference1' : 'reference2',
        mobileNumber: refForm.phone,
        firstName: refForm.fname,
        middleName: refForm.mname,
        lastName: refForm.lname,
        emailId: refForm.email,
        addressLine1: refForm.peraddressline1,
        addressLine2: refForm.peraddressline2,
        addressLine3: refForm.peraddressline3,
        country: 'India',
        // state: this.perselectedStateLabel,
        // city: this.perselectedCityLabel,
        state: this.perselectedStateLabelArr[this.currentRefIndex],
        city: this.perselectedCityLabelArr[this.currentRefIndex],
        pincode: refForm.perpincode,
        customerCifId: custID,
        isNewCustomer: this.isdata ? 1 : 0,
         applicantId: this.applicantId,
      }
    };

    this.loanformservice.saveReference(input, this.applicationId).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          if (isRef1) {
            this.reference1Filled = true;
          } else {
            this.reference2Filled = true;
          }

          this.closeReferenceModalOnly();
          setTimeout(() => {
            const successEl = document.getElementById('successModal');
            if (successEl) {
              this.successModalInstance = new bootstrap.Modal(successEl, {
                backdrop: 'static',
                keyboard: false
              });
              this.successModalInstance.show();
            }
          }, 300);


        }
      }
    });
  }
  isFormChanged(): boolean {
    const index = this.currentRefIndex;

    const array =
      index === 0 ? this.reference1Array : this.reference2Array;

    return JSON.stringify(array.at(0).value) !==
      JSON.stringify(this.savedReferenceData[index]);
  }


  // ==================== CLOSE MODAL ====================
  closeSuccessModal() {
    if (this.successModalInstance) {
      this.successModalInstance.hide();
      this.successModalInstance = null;
    }
  }
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    }
    if (this.phone) {
      // this.phone.reset();
      this.phone.resetForm?.();
    }
    // this.referenceForm.reset();
    // this.reference1Array.clear();
    // this.reference2Array.clear();
    // this.reference1Array.push(this.createReferenceGroup());
    // this.reference2Array.push(this.createReferenceGroup());


    const index = this.currentRefIndex;
    const array = index === 0 ? this.reference1Array : this.reference2Array;

    const isSaved =
      index === 0 ? this.reference1Filled : this.reference2Filled;

    //  Only reset if NOT saved
    if (!isSaved) {
      array.clear();
      array.push(this.createReferenceGroup());
      this.savedReferenceData[index] = {};
    }

    this.popupStep = 1;
    this.mobileNumber = '';
    this.isSearchDone = false;
    this.isdata = false;
    this.submitAttempted = false;
    this.reference2Touched = false;
    this.ismiddlename = [false, false];
    this.perStateSelectedOption = null;
    this.perCitySelectedOption = null;
    this.perselectedStateLabel = '';
    this.perselectedCityLabel = '';
    this.cityOptions = [];

    this.referenceForm.updateValueAndValidity({ emitEvent: false });
  }
  closeReferenceModalOnly() {
    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance = null;
    }

    // DO NOT reset form or arrays here
    this.popupStep = 1;
    this.isSearchDone = false;
    this.submitAttempted = false;
  }

  handleCloseModal() {
    const isSaved =
      this.currentRefIndex === 0
        ? this.reference1Filled
        : this.reference2Filled;

    if (isSaved) {
      this.closeReferenceModalOnly();
    } else {
      this.closeModal();
    }
  }

  back() {
    this.stepperService.previous();
  }
  //disabled
  get canSaveReference1(): boolean {
    const array =
      this.currentRefIndex === 0
        ? this.reference1Array
        : this.reference2Array;

    if (!array || !array.at(0)) return false;

    const errors: any = {};

    if (this.currentRefIndex === 1) {
      if (this.referenceForm.hasError('sameEmail') || this.referenceForm.hasError('samePhone')
      ) {
        errors.sameEmail = true;
        return false;
      }
    }

    const group = array.at(0) as FormGroup;

    const middleNameOk =
      this.ismiddlename[this.currentRefIndex] ||
      !!group.get('mname')?.value;


    const fname = group.get('fname')?.value?.trim();
    const lname = group.get('lname')?.value?.trim();
    const phone = group.get('phone')?.value?.trim();

    const hasSameEmail = this.referenceForm.hasError('sameEmail');

    return (
      (fname && lname && middleNameOk) || hasSameEmail
    );
  }

  get canSaveReference(): boolean {
    const array = this.currentRefIndex === 0 ? this.reference1Array : this.reference2Array;
    if (!array || !array.at(0)) return false;

    const group = array.at(0) as FormGroup;

    if (!group.valid) return false;

    if (!this.ismiddlename[this.currentRefIndex]) {
      const mname = group.get('mname')?.value?.trim();
      if (!mname || mname.length < 2) return false;
    }

    if (this.currentRefIndex === 1) {
      if (this.referenceForm.hasError('sameEmail')) return false;
      if (this.referenceForm.hasError('samePhone')) return false;
    }

    return true;
  }


  isPayloadChanged(current: any, saved: any) {
    return JSON.stringify(current) !== JSON.stringify(saved);
  }

  buildReferencePayload() {
    return {
      reference1: this.reference1Array.getRawValue(),
      reference2: this.reference2Array.getRawValue(),
      reference1Filled: this.reference1Filled,
      reference2Filled: this.reference2Filled,
      
    };
  }

  //get saved data from api
  getSavedReferenceInfo(): Promise<any> {
    return new Promise((resolve) => {
      this.loanformservice.getSavedData(
        this.applicationId,
        this.applicantId,
        "SAVE_REFERENCES"
      ).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            resolve(res.data.data);
          } else {
            resolve(null);
          }
        },
        error: () => resolve(null)
      });
    });
  }
  saveExit() {
    const input = this.buildReferencePayload();

    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(input));

    const inputdata = {
      action: "auto-save",
      sectionKey: "SAVE_REFERENCES",
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      jsonData: input
    };

    this.loanformservice.saveandExit(inputdata).subscribe({

      next: () => {
        this.lastSavedPayload = { ...input };
        console.log('Reference draft saved successfully');
      },
      error: (err) => {
        console.error('Save & Exit failed', err);
      }

    });
  }

  next() {
    if (!(this.reference1Filled && this.reference2Filled)) {
      return;
    }

    const payload = this.buildReferencePayload();

    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(payload));

    this.loanformservice.referenceInfoData = payload;
    this.lastSavedPayload = { ...payload };

    this.stepperService.markStepCompleted('referenceinfo');
    this.stepperService.setStepData('referenceinfo', payload);
    this.stepperService.next();
  }
  next1() {
    if (this.reference1Filled && this.reference2Filled) {

      const payload = {
        reference1: this.reference1Array.getRawValue(),
        reference2: this.reference2Array.getRawValue(),
        reference1Filled: this.reference1Filled,
        reference2Filled: this.reference2Filled
      };


      this.loanformservice.referenceInfoData = payload;
      const key = `referenceinfoData_main${this.applicantId}`;
      localStorage.setItem(key, JSON.stringify(payload));
      this.stepperService.markStepCompleted('referenceinfo');
      this.stepperService.setStepData('referenceinfo', payload);
      this.stepperService.next();
    }


  }
}