import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Main } from '../../../../core/service/main';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { interval, Subscription } from 'rxjs';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Otpsection } from '../../customer/otpsection/otpsection';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepper } from '../loanstepper/loanstepper';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-basicinfo',
  imports: [CommonModule, Inputfield, Buttons, ReactiveFormsModule, Checkbox, Otpsection],
  standalone: true,
  templateUrl: './basicinfo.html',
  styleUrl: './basicinfo.scss'
})
export class Basicinfo {

  openIndex: number | null = 0;
  accordions = [
    { title: 'Basic Info ', alwaysOpen: true },

  ];

  applicationId: any;
  applicantId: any;

  co_applicationId: any;
  co_applicantId: any;
  co_applicantName: any;

  otpsent = false;
  otpVerifiedOk = false;
  sendotpId: any
  otpmsg: any;
  otpState: any;
  prefillPhone: any;

  timeLeft = 0;
  timerSub?: Subscription;
  otpVerified = false;
  isOtpComplete: boolean = false
  hasStarted: boolean = false
  resendSeconds = 60;
  isCounting = false;
  timerId: any;
  resetCounter = 0;

  ismiddlename = false;
  showMiddleNameError = false;
  submitAttempted = false;
  registerForm!: FormGroup;

  isCoApplicant: boolean = false;
  lastSavedPayload: any = null;

  // @Input() prefillPhone: string = '';

  constructor(private fb: FormBuilder, public main: Main, private addcustomerservice: Addcustomerservice, private cd: ChangeDetectorRef,
    private router: Router, private loanform: Loanformservice, private stepperService: Loanstepperservice, private route: ActivatedRoute) { }


  async ngOnInit() {
    this.isCoApplicant = this.router.url.includes('co-applicant');

    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );
    this.stepperService.restoreLoanEditContext();
this.stepperService.restoreLoanIdFromSession();

    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];


    const params = this.route.snapshot.queryParams;
    this.sendotpId = params['id'];
    const mode = params['mode'] || '';
    const queryPhone = params['phone'];
    const currentIndex = Number(params['coApplicantIndex']) || this.stepperService.getCurrentCoApplicantIndex();

    this.stepperService.setCurrentCoApplicantIndex(currentIndex);


    this.registerForm = this.fb.group({
      fname: ['', [
        Validators.required,
        Validators.pattern('^[A-Za-z ]+$'),
        Validators.minLength(2),
        Validators.maxLength(25)
      ]],

      mname: ['', [
        Validators.pattern('^[A-Za-z ]+$'),
        Validators.minLength(2),
        Validators.maxLength(25)
      ]],

      lname: ['', [
        Validators.required,
        Validators.pattern('^[A-Za-z ]+$'),
        Validators.minLength(2),
        Validators.maxLength(25)
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern('^[6-9][0-9]{9}$')
      ]],

      email: ['', [
        Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'),
        Validators.minLength(10),
        Validators.maxLength(40)
      ]]
    });


    const currentCoapp = this.getCurrentCoApplicantFromList();

    const finalPhone =
      queryPhone ||
      currentCoapp?.phone ||
      '';

    this.prefillPhone = finalPhone;

    this.registerForm.patchValue({
      phone: finalPhone
    }, { emitEvent: false });



    if (mode === 'new' || !currentCoapp?.applicantId) {
      this.resetBasicFormForNewCoapp(finalPhone);
      return;
    }

    // ✅ existing coapp: patch from local or API
    await this.loadExistingCoappBasicInfo(currentCoapp);


    if (this.loanform.isEditFlow()) {
      this.patchFromSummary();
      return;
    }


    const key = this.getStorageKey();
    const localData = localStorage.getItem(key);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    // const apiData = await this.getSavedbasicInfo();

    let finalData = null;


    //  1. First priority: indexed local data
    if (parsedLocal && this.isBasicInfoComplete(parsedLocal)) {
      finalData = parsedLocal;
    }

    //  2. API only if CIF already generated for this coapp
    const coApplicantApplicantId = this.getCoApplicantApplicantId();

    if (!finalData && coApplicantApplicantId) {
      const apiData = await this.getSavedbasicInfo(coApplicantApplicantId);

      if (apiData && this.isBasicInfoComplete(apiData)) {
        finalData = apiData;
        localStorage.setItem(key, JSON.stringify(apiData));
      }
    }

    //  3. Patch only if actual coapp data found
    if (finalData) {
      this.loanform.co_basicInfoData = finalData;

      this.patchBasicInfo(finalData);

      this.lastSavedPayload = this.buildBasicPayload(
        this.registerForm.getRawValue()
      );

      this.stepperService.markStepCompleted('co-basicinfo');

    } else {
      //  new coapp: keep only phone prefilled
      this.registerForm.patchValue({
        fname: '',
        mname: '',
        lname: '',
        email: '',
        phone: finalPhone
      }, { emitEvent: false });

      this.ismiddlename = false;
      this.registerForm.get('mname')?.enable({ emitEvent: false });

      this.lastSavedPayload = null;
    }

  }
  get f() {
    return this.registerForm.controls;
  }

  onCheckboxChange(value: boolean) {
    this.ismiddlename = value;
    const mname = this.registerForm.get('mname');
    if (value) {
      mname?.disable();
      mname?.setValue('');
    } else {
      mname?.enable();
    }

  }

  createcustId() {
    if (this.registerForm.invalid || !this.otpVerifiedOk) {
      return;
    }

    console.log(this.registerForm.value);
  }
  isBasicInfoComplete(data: any): boolean {
    return !!(
      data?.firstName &&
      data?.lastName &&
      (data?.phoneNumber || data?.phone || data?.mobileNumber)
    );
  }

  resetBasicFormForNewCoapp(phone: string) {
    this.registerForm.reset({
      fname: '',
      mname: '',
      lname: '',
      email: '',
      phone: phone || ''
    }, { emitEvent: false });

    this.prefillPhone = phone || '';

    this.ismiddlename = false;
    this.registerForm.get('mname')?.enable({ emitEvent: false });

    this.lastSavedPayload = null;

  }
  async loadExistingCoappBasicInfo(currentCoapp: any) {
    const key = this.getStorageKey();

    const localData = localStorage.getItem(key);
    const parsedLocal = localData ? JSON.parse(localData) : null;

    let finalData = null;

    // first local indexed data
    if (parsedLocal && this.isBasicInfoComplete(parsedLocal)) {
      finalData = parsedLocal;
    }

    // then API using coapp applicantId only
    if (!finalData && currentCoapp?.applicantId) {
      const apiData = await this.getSavedbasicInfo(currentCoapp.applicantId);

      if (apiData && this.isBasicInfoComplete(apiData)) {
        finalData = apiData;
        localStorage.setItem(key, JSON.stringify(apiData));
      }
    }

    if (finalData) {
      this.patchBasicInfo(finalData);
      this.lastSavedPayload = this.buildBasicPayload(
        this.registerForm.getRawValue()
      );

      this.stepperService.markStepCompleted('co-basicinfo');
    }
  }
  resendOtp() {
    this.resetCounter++;
    console.log("Resend OTP API call here");

    const input = {

      "phoneNumber": this.prefillPhone,
      "context": "SIGNUP",
      "sourceId": "WEB",
      "deviceId": "",
      "userId": this.sendotpId
    }
    this.startTimer();
    this.addcustomerservice.ResendOTP(input).subscribe({
      next: (res) => {

      },
      error: (err) => {
        console.error("error msg", err);
      }
    })

  }



  sendOtp() {
    console.log("send otp");
    this.otpsent = true;
    const input = {

      "phoneNumber": this.prefillPhone,
      "context": "SIGNUP",
      "sourceId": "WEB",
      "deviceId": "",
      "userId": this.sendotpId
    }
    this.startTimer()
    this.addcustomerservice.SendOTP(input).subscribe({
      next: (res) => {
        console.log(res);


      },
      error: (err) => {
        console.error("error msg", err);
      }
    })

  }

  startTimer() {

    // stop any existing timer first
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }

    this.resendSeconds = 60;
    this.isCounting = true;

    this.timerSub = interval(1000).subscribe(() => {
      this.resendSeconds--;
      this.cd.detectChanges();

      // console.log(this.resendSeconds);

      if (this.resendSeconds <= 0) {
        this.isCounting = false;
        this.timerSub?.unsubscribe();
        this.timerSub = undefined;
        this.cd.detectChanges();
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  onTimer(timeLeft: number) {
    console.log('Time left:', timeLeft);
    this.timeLeft = timeLeft;
  }

  onOtpSubmit(otp: string) {

    console.log('OTP submitted:', otp);


  }

  onOtpVerifiedSuccess(val: any) {
    console.log("onOtpVerifiedSuccess--", val);

    // this.otpVerifiedOk = val;

    if (val.status === "success") {
      this.otpVerifiedOk = true;
      this.otpState = "success";
    } else {
      this.otpVerifiedOk = false;
      this.otpState = "error";
    }

    this.otpmsg = val.message;


    setTimeout(() => {
      this.otpmsg = '';
    }, 1000);
  }


  getStorageKey() {
    const index = this.stepperService.getCurrentCoApplicantIndex();
    return `basicInfoData_coapp_${this.applicantId}_${index}`;
  }
  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }
  submit() { }

  isPayloadChanged(currentPayload: any, savedPayload: any): boolean {
    return JSON.stringify(currentPayload) !== JSON.stringify(savedPayload);
  }
  //edit flow patch from summary
  patchFromSummary() {
    if (!this.loanform.isEditFlow()) return;

    const data = this.loanform.summaryData;

    if (!data) return;

    const mappedData = {
      firstName: data.firstName || '',
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      emailId: data.emailId || '',
      phoneNumber: data.mobileNumber || ''
    };

    this.patchBasicInfo(mappedData);

    localStorage.setItem(
      this.getStorageKey(),
      JSON.stringify(this.lastSavedPayload)
    );
  }

  patchBasicInfo(data: any) {
    if (!data || !this.registerForm) return;

    this.prefillPhone =
      data.phoneNumber ||
      data.mobileNumber ||
      data.phone ||
      this.prefillPhone ||
      '';

    this.registerForm.patchValue({
      fname: data.firstName || data.fname || '',
      mname: data.middleName || data.mname || '',
      lname: data.lastName || data.lname || '',
      email: data.emailId || data.email || '',
      phone: this.prefillPhone
    }, { emitEvent: false });

    if (!data.middleName && !data.mname) {
      this.ismiddlename = true;
      this.registerForm.get('mname')?.disable({ emitEvent: false });
    }

    this.lastSavedPayload = this.buildBasicPayload(
      this.registerForm.getRawValue()
    );

    this.loanform.co_basicInfoData = this.lastSavedPayload;

    this.stepperService.markStepCompleted('co-basicinfo');
  }
  buildBasicPayload(formdata: any) {
    return {
      firstName: formdata.fname || '',
      middleName: formdata.mname || '',
      lastName: formdata.lname || '',
      emailId: formdata.email || '',
      phoneNumber: formdata.phone || this.prefillPhone || '',
      source: 'WEB',
      applicationId: this.applicationId,
    };
  }
  updateCoApplicantListAfterCif() {
    const index = this.stepperService.getCurrentCoApplicantIndex();
    const mainApplicantId = this.applicantId;

    const key = `coApplicants_${mainApplicantId}`;
    const saved = localStorage.getItem(key);
    let list = saved ? JSON.parse(saved) : [];

    const existingIndex = list.findIndex(
      (x: any) => Number(x.index) === Number(index)
    );

    const item = {
      index,
      userInitiateId: this.sendotpId,
      applicantId: this.co_applicantId,
      applicationId: this.co_applicationId,
      phone: this.registerForm.get('phone')?.value || this.prefillPhone,
      name:
        this.co_applicantName ||
        `${this.registerForm.get('fname')?.value || ''} ${this.registerForm.get('lname')?.value || ''}`.trim(),
      status: 'IN_PROGRESS'

    };

    if (existingIndex > -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...item
      };
    } else {
      list.push(item);
    }

    localStorage.setItem(key, JSON.stringify(list));
  }
  getCurrentCoApplicantFromList() {
    const index = this.stepperService.getCurrentCoApplicantIndex();
    const key = `coApplicants_${this.applicantId}`;

    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];

    return list.find((x: any) => Number(x.index) === Number(index));
  }

  getCoApplicantApplicantId(): any {
    const current = this.getCurrentCoApplicantFromList();

    // after CIF generation this should exist
    return current?.applicantId || null;
  }

  saveExit() {
    let formdata = this.registerForm.getRawValue();
    const input = this.buildBasicPayload(formdata);

    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(input));
    this.loanform.co_basicInfoData = input;

    const inputdata = {
      action: "auto-save",
      sectionKey: "PERSONAL_INFO1",
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      jsonData: input
    };

    this.loanform.saveandExit(inputdata).subscribe({
      next: () => {
        this.lastSavedPayload = { ...input };
      }
    });
  }
  getSavedbasicInfo(coApplicantApplicantId: any): Promise<any> {
    let sectionkey = "PERSONAL_INFO1"
    return new Promise((resolve) => {
      this.loanform.getSavedData(this.applicationId, coApplicantApplicantId, sectionkey).pipe()

        .subscribe({
          next: (res) => {

            console.log(res)
            if (res.status === "success") {
              resolve(res.data.data);

            }
            else {
              resolve(null);
            }
          }, error: () => resolve(null)
        });
    });
  }
  back() {
    this.loanform.coappStep = 1;
    this.router.navigate(['../coapplicantinfo']);
  }
  next() {
    let formdata = this.registerForm.getRawValue();
    if (this.registerForm.invalid) return;

    const input = this.buildBasicPayload(formdata);
    const hasChanged = this.isPayloadChanged(input, this.lastSavedPayload);


    if (!hasChanged) {
      console.log('No changes detected, skipping API');
      this.stepperService.markStepCompleted('co-basicinfo');
      this.stepperService.setStepData('co-basicinfo', formdata);
      this.stepperService.next();
      return;
    }

    this.addcustomerservice.generateCIF(input).subscribe({
      next: (res) => {
        console.log("cif genrated", res);
        this.loanform.co_basicInfoData = input

        const index = this.stepperService.getCurrentCoApplicantIndex();
        sessionStorage.setItem('coapp_cifdetails', JSON.stringify(res.data));
        const key = this.getStorageKey();

        localStorage.setItem(key, JSON.stringify(this.loanform.co_basicInfoData));

        this.co_applicantId = res.data.applicantId
        this.co_applicationId = res.data.applicationId
        this.co_applicantName = res.data.fullName || `${formdata.fname} ${formdata.lname}`.trim();

        this.stepperService.setCo_appId(this.co_applicantId, this.co_applicationId, this.co_applicantName, undefined, this.stepperService.getCurrentCoApplicantIndex());


        const coAppData = {
          applicantId: this.co_applicantId,
          applicationId: this.co_applicationId,
          fullName: this.co_applicantName,
          coApplicantIndex: this.stepperService.getCurrentCoApplicantIndex()
        };
        sessionStorage.setItem('coAppIds', JSON.stringify(coAppData));

        this.updateCoApplicantListAfterCif();
        if (this.isCoApplicant) {
          this.loanform.co_basicInfoData = input;
        } else {

        }


        localStorage.setItem(key, JSON.stringify(input));

        this.lastSavedPayload = { ...input };

        this.stepperService.markStepCompleted('co-basicinfo');
        this.stepperService.setStepData('co-basicinfo', formdata);
        this.stepperService.next();
      },
      error: (err) => {
        console.error("error msg", err);
      }
    })




  }
}
