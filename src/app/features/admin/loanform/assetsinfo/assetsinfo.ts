import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from "../../../systemdesign/inputfield/inputfield";
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';

@Component({
  selector: 'app-assetsinfo',
  standalone: true,
  imports: [CommonModule, Buttons, Dropdown, Inputfield,ReactiveFormsModule,Datepickernew],
  templateUrl: './assetsinfo.html',
  styleUrl: './assetsinfo.scss'
})
export class Assetsinfo implements OnInit {
  applicantId: any;
  applicationId: any;

 openIndex: number[] = [0];
  accordions = [
    { title: 'Gold ', alwaysOpen: true, key: 'gold' },
    { title: 'Liquid Assets ', alwaysOpen: true, key: 'LiquidAssets' },
    { title: 'Property/ Land Assets ', alwaysOpen: true, key: 'Property/LandAssets' },
    { title: 'Fixed Deposit ', alwaysOpen: true, key: 'FixedDeposit' },
    { title: 'Investments ', alwaysOpen: true, key: 'Investments' },

  ];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';
  assetsCatagories: DropdownOption[] = [
    { label: 'Gold', value: 'gold', icon: '' },
    { label: 'Liquid Assets', value: 'LiquidAssets', icon: '' },
    { label: 'Property/Land Assets', value: 'Property/LandAssets', icon: '' },
    { label: 'Fixed Deposit', value: 'FixedDeposit', icon: '' },
    { label: 'Investments', value: 'Investments', icon: '' },
  ];
  selectedAssets: string[] = [];

  assetsForm!: FormGroup;

  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute,
     private stepperService: Loanstepperservice, private formSvc: Loanformservice,private cd:ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.assetsForm = this.fb.group({
      goldvalue: [''],
      cashinhand: [''],
      savingbalance: [''],
      marketval: [''],
      location: [''],
      bankname:[''],
      bankamt:[''],
      maturitydate:[],
      stockvalue:[''],
      mutualfundvalue:['']
    });

  }

  onAssetChange(values: string | string[]): void {
    this.selectedAssets = Array.isArray(values) ? values : [values];

  this.openIndex = [];

  this.selectedAssets.forEach(val => {
    const index = this.accordions.findIndex(a => a.key === val);
    if (index !== -1) {
      this.openIndex.push(index);
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
    if (this.assetsForm.invalid) return;

    console.log(this.assetsForm.value);
  }

  addmore() {
    
  }
  back() {
    this.stepperService.previous();
  }


  next() {
    this.stepperService.next();
  }
}
