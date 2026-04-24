import { ChangeDetectorRef, Component, effect, EventEmitter, OnInit, Output, Type, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Main } from '../../../../core/service/main';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Otpsection } from "../otpsection/otpsection";
import { Uploadkyc } from "../uploadkyc/uploadkyc";
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { Successbox } from "../successbox/successbox";
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { interval, Subscription } from 'rxjs';
import { Messagebox } from '../../../systemdesign/messagebox/messagebox';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Inputfield, Checkbox, Otpsection, Uploadkyc, Buttons, Successbox,DecimalPipe],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.scss'
})
export class AddCustomer implements OnInit {
  // Step = Step1;
  // step: Step1 = Step1.KYC;
  totalSteps = 3;
  form: any;
  @Output() close = new EventEmitter<void>();
  // @Output() custid = new EventEmitter<void>();
  // @Output() ncid = new EventEmitter<void>();

  ismiddlename: boolean = false;

  isnewcustomer: boolean = false;
  otpsent: boolean = false;
  currentStep = 0;
  maxAllowedStep = 0;
  prefillPhone: any;
  sendotpId: any
  otpmsg: any;
  otpState: any;
  otpVerifiedOk = false;
  custid: any;
  custname: any
  kycIdFromApi: string = '';
  timeLeft = 0;

  timerSub?: Subscription;
  otpVerified = false;
  isOtpComplete: boolean = false
  hasStarted: boolean = false
  resendSeconds = 60;
  isCounting = false;
  timerId: any;

showMiddleNameError = false;

  steps = [
    {
      title: 'Add Customer',
      desc: 'Enter basic details to register a new customer.'
    },
    {
      title: 'Create Customer ID',
      desc: 'Generate a unique ID to track the customer.'
    },
    {
      title: 'KYC',
      desc: 'Verify the customer’s identity with documents.'
    },
    {
      title: 'Create NC ID',
      desc: 'Create an NC ID to proceed with loan processing.'
    }
  ];

  description1 = `Your customer has been added successfully. You can now \ncontinue with KYC and loan processing.`;

  description2 = `The customer's KYC details have been submitted and  \nthe profile is now active.`;

  resetCounter = 0;
  
  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private addcustomerservice: Addcustomerservice, 
    private cd: ChangeDetectorRef, private router: Router,private msgBox:Msgboxservice) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['phone']) {
        this.prefillPhone = params['phone'];
        this.sendotpId = params['id'];
        this.currentStep=0;
        this.maxAllowedStep=0;
      }
      if (params['step'] == 2) {
        this.currentStep = +params['step'];
        console.log("currentstep", this.currentStep);
        sessionStorage.removeItem('editUser');
        if (params['edit'] === 'true') {
        this.maxAllowedStep = this.currentStep;
      }
        if (params['custId'] && params['edit'] == 'true') {
           this.custname = params['fname'] + ' ' + params['lname'];
          sessionStorage.setItem('editUser', JSON.stringify({
            custId: params['custId'],
            fname: params['fname'],
            lname: params['lname']
          }));

        }
      }
       if (params['step'] == 0) {
        this.currentStep = +params['step'];
        console.log("currentstep", this.currentStep);
       this.prefillPhone = params['phone'];
       this.maxAllowedStep = this.currentStep;
       
      }



    });
  }



  back() {
    this.router.navigate(['/admin/customer']);
  }


  createcustId(data: NgForm) {

        
const isMiddleNameEmpty = !data.value.mname;
  const isCheckboxUnchecked = !this.ismiddlename;

  if (isMiddleNameEmpty && isCheckboxUnchecked) {
    this.showMiddleNameError = true;
    return;
  }

  this.showMiddleNameError = false;
  
    if (data.invalid) {
      data.control.markAllAsTouched();
      return;
    }

    if (!this.otpVerifiedOk) {
      return;
    }




    const payload1 = {
      ...data.value,
      phone: this.prefillPhone || data.value.phone
    };

    const payload =
    {
      "firstName": data.value.fname,
      "middleName": data.value.mname,
      "lastName": data.value.lname,
      "emailId": data.value.email,
      "phoneNumber": this.prefillPhone,
      "source": "WEB",
    }
    sessionStorage.removeItem('cifdetails');
    sessionStorage.setItem('userdetails', JSON.stringify(payload1));
    console.log("payload", payload);

    this.addcustomerservice.generateCIF(payload).subscribe({
      next: (res) => {
        console.log("cif genrated", res);
        // this.goToStep(1);
        sessionStorage.setItem('cifdetails', JSON.stringify(res.data));
        this.custid = res.data.cifId;
        this.custname = res.data.fullName;
        //  this.cd.detectChanges();

        setTimeout(() => {
          this.goToStep(1);
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error("error msg", err);
      }
    })

  }

  setKycId(id: string) {
    console.log("Received KYC ID:", id);
    this.kycIdFromApi = id;
    this.custname = this.custname
  }

  onCheckboxChange(value: boolean): void {
    this.ismiddlename = value;
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
  onOtpSubmit(otp: string) {

    console.log('OTP submitted:', otp);


  }

  onTimer(timeLeft: number) {
    console.log('Time left:', timeLeft);
    this.timeLeft = timeLeft;
  }
  handleOtpStatus(status: string) {
    let message = '';
    let state1: 'error' | 'success' | 'info' = 'info';

    switch (status) {

      case 'error':
        message = 'Invalid OTP. Please try again.';
        state1 = 'error';
        break;

      case 'EXPIRED':
        message = 'OTP has expired. Please resend OTP.';
        state1 = 'error';
        break;

      case 'success':
        message = 'OTP verified successfully.';
        state1 = 'success';
        break;

      default:
        message = '';
        state1 = 'error';
    }

    this.otpmsg = message;

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



  goToStep(step: number) {
      this.currentStep = step;
    this.maxAllowedStep = Math.max(this.maxAllowedStep, step);
  }


  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  handleSuccessAction(action: string) {
    if (action === 'proceedToKYC') {

      this.goToStep(2);
    }

    if (action === 'ToDashboard') {
       this.msgBox.open({
      title: 'Are you sure want to go to Dashboard?',
      message: ``,
      showCancel: true,
      onOk: () => {
       this.router.navigate(['/admin/customer']);
      }
    });

      
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

  goTocontact() {
    this.router.navigate(['/admin/customer/checkcontact'],
      {queryParams:{ phone: this.prefillPhone }})
    
  }
}
