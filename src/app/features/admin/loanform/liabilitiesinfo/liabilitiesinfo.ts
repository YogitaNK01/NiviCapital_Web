import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';

@Component({
  selector: 'app-liabilitiesinfo',
  imports: [CommonModule,ReactiveFormsModule,Buttons,Dropdown,Inputfield],
  standalone:true,
  templateUrl: './liabilitiesinfo.html',
  styleUrl: './liabilitiesinfo.scss'
})
export class Liabilitiesinfo {

    applicantId: any;
  applicationId: any;

 openIndex: number[] = [0];
  accordions = [
    { title: 'Existing Loans ', alwaysOpen: true, key: 'ExistingLoans' },
    { title: 'Credit Card Outstanding ', alwaysOpen: true, key: 'CreditCardOutstanding' },
    { title: 'Buy Now Pay Later (BNPL)', alwaysOpen: true, key: 'BuyNowPayLater' },
    { title: 'Other Liabilities', alwaysOpen: true, key: 'OtherLiabilities' },
  ];

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  maritalstatus: string = 'Marital Status';
  liabilitiesCatagories: DropdownOption[] = [
    { label: 'Existing Loans', value: 'ExistingLoans', icon: '' },
    { label: 'Credit Card Outstanding', value: 'CreditCardOutstanding', icon: '' },
    { label: 'Buy Now Pay Later (BNPL)', value: 'BuyNowPayLater', icon: '' },
    { label: 'Other Liabilities', value: 'OtherLiabilities', icon: '' },
  ];
  selectedliabilities: string[] = [];

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
    this.selectedliabilities = Array.isArray(values) ? values : [values];

  this.openIndex = [];

  this.selectedliabilities.forEach(val => {
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
