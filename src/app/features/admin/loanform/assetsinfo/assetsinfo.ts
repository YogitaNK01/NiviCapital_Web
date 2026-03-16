import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from "../../../systemdesign/inputfield/inputfield";
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Msgboxservice } from '../../../../core/service/msgboxservice';

@Component({
  selector: 'app-assetsinfo',
  standalone: true,
  imports: [CommonModule, Buttons, Dropdown, Inputfield, ReactiveFormsModule, Datepickernew],
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

  constructor(private fb: FormBuilder, public main: Main, private route: ActivatedRoute, private msgBox: Msgboxservice,
    private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.assetsForm = this.fb.group({
      gold: this.fb.group({
        goldvalue: ['', Validators.required]
      }),
      

      liquidAssets: this.fb.group({
        cashinhand: ['', Validators.required],
        savingbalance: ['', Validators.required]
      }),

      properties: this.fb.array([this.createProperty()]),

      fixedDeposits: this.fb.array([this.createFD()]),

      investments: this.fb.group({
        stockvalue: ['', Validators.required],
        mutualfundvalue: ['', Validators.required]
      })
    });

  }

  get properties(): FormArray {
    return this.assetsForm.get('properties') as FormArray;
  }

  get fixedDeposits(): FormArray {
    return this.assetsForm.get('fixedDeposits') as FormArray;
  }

  createProperty(): FormGroup {
    return this.fb.group({
      propertytype: ['', Validators.required],
      ownershiptype: ['', Validators.required],
      marketval: ['', Validators.required],
      location: ['', Validators.required]
    });
  }
  addProperty() {
    this.properties.push(this.createProperty());
  }

  createFD(): FormGroup {
    return this.fb.group({
      bankname: ['', Validators.required],
      bankamt: ['', Validators.required],
      maturitydate: ['', Validators.required]
    });
  }
  addFD() {
    this.fixedDeposits.push(this.createFD());
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

   removeAccordion(key: string, index: number, event: Event) {

    event.stopPropagation(); 

    this.selectedAssets =
      this.selectedAssets.filter(k => k !== key);

    this.openIndex =
      this.openIndex.filter(i => i !== index);

    this.assetsForm.get(key)?.reset();

  }

  submit() {
    if (this.assetsForm.invalid) return;

    console.log(this.assetsForm.value);
  }


  back() {
    this.stepperService.previous();
  }


  next() {
    this.stepperService.next();
  }
}
