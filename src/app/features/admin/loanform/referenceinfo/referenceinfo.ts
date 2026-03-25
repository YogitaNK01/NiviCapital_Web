import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';

@Component({
  selector: 'app-referenceinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Inputfield, Checkbox],
  templateUrl: './referenceinfo.html',
  styleUrl: './referenceinfo.scss'
})
export class Referenceinfo implements OnInit {

  openIndex: number[] = [0];
  accordions = [
    { title: 'Reference 1', alwaysOpen: true },
    { title: 'Reference 1', alwaysOpen: false },
  ];
  referenceForm!: FormGroup

  isdata: boolean = false;

  private mobileSubject = new Subject<string>();
  ismiddlename: boolean = false;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }
  ngOnInit(): void {


    this.referenceForm = this.fb.group({
      fname: ['', Validators.required],
      mname: ['', Validators.required],
      lname: ['', Validators.required],
      peraddressline1: ['', Validators.required],
      peraddressline2: ['', Validators.required],
      peraddressline3: ['', Validators.required],
      percountry: ['', Validators.required],
      perstate: ['', Validators.required,],
      percity: ['', Validators.required,],
      perpincode: ['', Validators.required,],
    });

    this.mobileSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if (value.length === 10) {
          this.searchMobile(value);
        }
      });
  }


  get f() {
    return this.referenceForm.controls;
  }

  onMobileInput(event: any) {
    const value = event.target.value;
    this.mobileSubject.next(value);
  }
  onmiddlename(value: boolean): void {
    this.ismiddlename = value;
  }
  searchMobile(mobile: string) {
    let input = {
      identifier: mobile,
      type: "MOBILE"

    }

    this.apiservice.customersearch(input).subscribe(res => {
      if (res.message.includes('Existing customer found')) {

        console.log('search mobile Result');
      } else {
        this.isdata = false;
      }
    });
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

  back() {
    this.stepperService.previous();
  }

  next() {

    this.stepperService.next();
  }
}
