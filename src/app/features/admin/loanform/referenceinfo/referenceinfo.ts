import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';


interface OptionItem {
  label: string;
  value: string;
}

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
    { title: 'Reference 2', alwaysOpen: false },
  ];
  referenceForm!: FormGroup

  isdata: boolean = false;

  private mobileSubject = new Subject<string>();
  ismiddlename: boolean = false;

  perStateSelectedOption: any;
  perCitySelectedOption: any;

  stateOptions: OptionItem[] = [];
  cityOptions: OptionItem[] = [];

  perselectedStateId!: string;
  perselectedStateLabel!: string;

  perselectedCityId!: string;
  perselectedCityLabel!: string;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }
  ngOnInit(): void {


    this.referenceForm = this.fb.group({
      reference1: this.fb.array([this.createReferenceGroup()]),
      reference2: this.fb.array([this.createReferenceGroup()])
    })

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

      if( this.loanformservice.referenceInfoData ){
        this.patchReferenceData();
      }
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

  createReferenceGroup(): FormGroup {
    return this.fb.group({
      fname: ['', Validators.required],
      mname: ['', Validators.required],
      lname: ['', Validators.required],
      peraddressline1: ['', Validators.required],
      peraddressline2: ['', Validators.required],
      peraddressline3: [''],
      percountry: ['', Validators.required],
      perstate: ['', Validators.required],
      percity: ['', Validators.required],
      perpincode: ['', Validators.required],
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

  this.reference1Array.clear();
  this.reference2Array.clear();

  // ---------------- REFERENCE 1 ----------------
  if (data.reference1 && data.reference1.length) {
    data.reference1.forEach((item: any) => {

      const group = this.createReferenceGroup();

      group.patchValue({
        fname: item.fname,
        mname: item.mname,
        lname: item.lname,
        peraddressline1: item.peraddressline1,
        peraddressline2: item.peraddressline2,
        peraddressline3: item.peraddressline3,
        percountry: item.percountry,
        perstate: item.perstate,
        percity: item.percity,
        perpincode: item.perpincode,
        phone: item.phone
      });

      this.reference1Array.push(group);
    });
  }

  // ---------------- REFERENCE 2 ----------------
  if (data.reference2 && data.reference2.length) {
    data.reference2.forEach((item: any) => {

      const group = this.createReferenceGroup();

      group.patchValue({
        fname: item.fname,
        mname: item.mname,
        lname: item.lname,
        peraddressline1: item.peraddressline1,
        peraddressline2: item.peraddressline2,
        peraddressline3: item.peraddressline3,
        percountry: item.percountry,
        perstate: item.perstate,
        percity: item.percity,
        perpincode: item.perpincode,
        phone: item.phone
      });

      this.reference2Array.push(group);
    });
  }

  if (this.reference1Array.length === 0) {
    this.reference1Array.push(this.createReferenceGroup());
  }

  if (this.reference2Array.length === 0) {
    this.reference2Array.push(this.createReferenceGroup());
  }

  this.cd.detectChanges();
}
  back() {
    this.stepperService.previous();
  }

  next1() {

    this.stepperService.next();
  }
  next() {

  if (this.referenceForm.invalid) {
    this.referenceForm.markAllAsTouched();
    return;
  }

  const form = this.referenceForm.value;

  const payload = {
    reference1: form.reference1,
    reference2: form.reference2
  };

  console.log("REFERENCE PAYLOAD:", payload);

  // this.loanformservice.saveReference(payload).subscribe({
  //   next: (res: any) => {
  //     if (res.status === 'success') {

  //      
  //       this.loanformservice.referenceInfoData = payload;

  //       this.stepperService.next();
  //     }
  //   }
  // });
}
}