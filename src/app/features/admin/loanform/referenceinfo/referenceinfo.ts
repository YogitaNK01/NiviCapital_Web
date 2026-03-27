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

  back() {
    this.stepperService.previous();
  }

  next() {

    this.stepperService.next();
  }
}