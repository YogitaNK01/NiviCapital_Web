import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { Main } from '../../../../core/service/main';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-otpsection',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './otpsection.html',
  styleUrl: './otpsection.scss'
})
export class Otpsection implements OnInit {

  @Input() length: number = 6;
  @Output() otpSubmit = new EventEmitter<string>();
  @Output() otpVerifiedSuccess = new EventEmitter<any>();
  @Output() otp_Verified = new EventEmitter<string>();

  @Output() timer = new EventEmitter<number>();
  @Output() resendbtn = new EventEmitter<number>();


  otp: string[] = [];
  phonenumber: any;
  sendotpId: any;

  timerSub?: Subscription;
  otpVerified = false;
  isOtpComplete: boolean = false
  hasStarted: boolean = false
  resendSeconds = 60;
  isCounting = false;
  timerId: any;

  constructor(public mainservice: Main, public addcustomerservice: Addcustomerservice, private route: ActivatedRoute, private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.otp = Array(this.length).fill('');
    this.route.queryParams.subscribe(params => {

      this.phonenumber = params['phone'];
      this.sendotpId = params['id'];
    });
  }


  onKeyDown(event: KeyboardEvent, index: number) {
    const key = event.key;

    // DIGIT
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();

      const copy = [...this.otp];
      copy[index] = key;
      this.otp = copy;

      this.isOtpComplete = this.otp.every(d => d !== '');

      if (index < this.length - 1) {
        setTimeout(() => {
          document.getElementById(`otp-${index + 1}`)?.focus();
        });
      }
      return;
    }

    // BACKSPACE
    if (key === 'Backspace') {
      event.preventDefault();

      const copy = [...this.otp];

      if (copy[index]) {
        copy[index] = '';
      } else if (index > 0) {
        copy[index - 1] = '';
        setTimeout(() => {
          document.getElementById(`otp-${index - 1}`)?.focus();
        });
      }

      this.otp = copy;
      this.isOtpComplete = this.otp.every(d => d !== '');

      return;
    }

    if (key !== 'Tab') event.preventDefault();

    console.log("OTP:", this.otp, "complete:", this.isOtpComplete);


  }


  //verifyotp
  submitOtp() {

    if (!this.isOtpComplete || this.isCounting) return;
    this.hasStarted = true;

    const finalOtp = this.otp.join('');
    if (finalOtp.length === this.length) {
      this.otpSubmit.emit(finalOtp);
    }
    console.log(finalOtp);


    const input = {
      "phoneNumber": this.phonenumber,
      "context": "SIGNUP",
      "otp": finalOtp
    }
    this.addcustomerservice.verifyOTP(input).subscribe({
      next: (res) => {
        console.log("verifyotp---",res);
        // this.otpSubmit.emit(res.status);
        this.otp_Verified.emit(res);

        if (res.status === "success") {
          this.otpVerified = true;
        } else {
          this.otpVerified = false;
        }

        this.otpVerifiedSuccess.emit(res);


      },
      error: (err) => {
        this.otpVerified = false;
        console.error("error msg", err);
      }
    })
    // this.startTimer();
  }

  startTimer() {

    // stop any existing timer first
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }

    this.resendSeconds = 10;
    this.isCounting = true;

    this.timerSub = interval(1000).subscribe(() => {
      this.resendSeconds--;
      this.timer.emit(this.resendSeconds);
      this.cdr.detectChanges();

      console.log(this.resendSeconds);

      if (this.resendSeconds <= 0) {
        this.isCounting = false;
        this.timerSub?.unsubscribe();
        this.timerSub = undefined;
        this.cdr.detectChanges();
      }
    });
  }



  get buttonLabel(): string {
    if (!this.hasStarted) return 'Verify OTP';
    if (this.isCounting) return `Resend`;
    return 'Resend OTP';
  }





  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }


}
