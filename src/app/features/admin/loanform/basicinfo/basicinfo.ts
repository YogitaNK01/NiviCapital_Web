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


  ngOnInit(): void {
    this.isCoApplicant = this.router.url.includes('co-applicant');

    const params = this.route.snapshot.queryParams;
    

    // Store in variables if needed
    this.applicantId = params['applicantId'];
    this.applicationId = params['applicationId'];
    this.sendotpId = params['id'];

    
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


    if (this.loanform.coapppmobile) {
      this.registerForm.patchValue({
        phone: this.loanform.coapppmobile
      });
      this.prefillPhone = this.loanform.coapppmobile;
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


  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }
  submit() { }

  isPayloadChanged(currentPayload: any, savedPayload: any): boolean {
    return JSON.stringify(currentPayload) !== JSON.stringify(savedPayload);
  }

  buildBasicPayload(formdata: any) {

    let input =
    {
      "firstName": formdata.fname,
      "middleName": formdata.mname,
      "lastName": formdata.lname,
      "emailId": formdata.email,
      "phoneNumber": this.prefillPhone,
      "source": "WEB",
    }
    return input;
  }
  saveExit() {
    let formdata = this.registerForm.value;
    const input = this.buildBasicPayload(formdata);

    // const key = this.getStorageKey();
    // localStorage.setItem(key, JSON.stringify(input));

    const inputdata = {
      action: "auto-save",
      sectionKey: "PERSONAL_INFO",
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
  getSavedAdditionalInfo(): Promise<any> {
    let sectionkey = "PERSONAL_INFO"
    return new Promise((resolve) => {
      this.loanform.getSavedData(this.applicationId, this.applicantId, sectionkey).pipe()

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
    let formdata = this.registerForm.value;
    if (this.registerForm.invalid) return;

    const input = this.buildBasicPayload(formdata);
    const hasChanged = this.isPayloadChanged(input, this.lastSavedPayload);


    if (!hasChanged) {
      console.log('No changes detected, skipping API');
      this.stepperService.markStepCompleted('basicInfo');
      this.stepperService.setStepData('basicInfo', formdata);
      this.stepperService.next();
      return;
    }

    this.addcustomerservice.generateCIF(input).subscribe({
      next: (res) => {
        console.log("cif genrated", res);
        this.loanform.co_basicInfoData = input


        sessionStorage.setItem('cifdetails', JSON.stringify(res.data));
        const key = `basicinfo_coapp_${this.applicantId}`

        localStorage.setItem(key, JSON.stringify(this.loanform.co_basicInfoData));


        if (this.isCoApplicant) {
          this.loanform.co_basicInfoData = input;
        } else {
          
        }
        this.lastSavedPayload = { ...input };

        this.stepperService.markStepCompleted('Basicinfo');
        this.stepperService.setStepData('Basicinfo', formdata);
        this.stepperService.next();
      },
      error: (err) => {
        console.error("error msg", err);
      }
    })




  }
}
