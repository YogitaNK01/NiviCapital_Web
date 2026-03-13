import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { ActivatedRoute, Router } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { FormsModule, NgForm } from '@angular/forms';
import { Charts } from "../../../systemdesign/charts/charts";
import { Loanformservice } from '../../../../core/service/loanformservice';

@Component({
  selector: 'app-loan-info',
  imports: [CommonModule, Buttons, Dropdown, FormsModule, Charts],
  standalone: true,
  templateUrl: './loan-info.html',
  styleUrl: './loan-info.scss'
})
export class LoanInfo implements OnInit {


  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';

  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  selectIncome: DropdownOption[] = [
    { label: '0-5 Lakhs', value: '0-5 Lakhs', icon: '' },
    { label: '5-10 Lakhs', value: '5-10 Lakhs', icon: '' },
    { label: '10-20 Lakhs', value: '10-20 Lakhs', icon: '' },
    { label: '20-30 Lakhs', value: '20-30 Lakhs', icon: '' },
    { label: '30-40 Lakhs', value: '30-40 Lakhs', icon: '' },
    { label: '40-50 Lakhs', value: '40-50 Lakhs', icon: '' },
    { label: '50-75 Lakhs', value: '50-75 Lakhs', icon: '' },
    { label: '75 Lakhs - 1 Crore', value: '75 Lakhs - 1 Crore', icon: '' },
    { label: '1 Crore & Above', value: '1 Crore & Above', icon: '' },
    { label: 'No Income', value: 'No Income', icon: '' },

  ]

  selectTenure: DropdownOption[] = [
    { label: '1yr', value: '1yr', icon: '' },
    { label: '2yr', value: '2yr', icon: '' },
    { label: '3yr', value: '3yr', icon: '' },
    { label: '4yr', value: '4yr', icon: '' },
    { label: '5yr', value: '5yr', icon: '' },
    { label: '6yr', value: '6yr', icon: '' },
    { label: '7yr', value: '7yr', icon: '' },
  ]

  selectpaymentmode: DropdownOption[] = [
    { label: 'EMI-Start Repaying Immediately', value: 'EMI', icon: '' },
    { label: 'SI–Pay Only Simple Interest During Study', value: 'SI', icon: '' },
    { label: 'Moratorium – No Payment During Study', value: 'Moratorium', icon: '' },

  ]

  occupation: any;
  annualIncome: number | null = null;
  rateOfInterest = 9.5;
  loanAmount = 1000000;
  tenure = 5;
  modeOfPayment = '';

  // Calculated values (demo values from your screenshot)
  totalInterestPayable = 173969;
  totalPrincipalAmount = 1000000;
  totalEmiAmount = 19566;

  annual_Income!: string;
  paymentmode!: string;

  interestPercentage = Math.round((this.totalInterestPayable / (this.totalPrincipalAmount + this.totalInterestPayable)) * 100);

  get totalPayable() {
    return this.totalPrincipalAmount + this.totalInterestPayable;
  }

  chartData1 = [
    { label: 'Total Principle amount', value: 25, color: '#0D4472' },
    { label: 'Total Interest payable', value: 75, color: '#F33B48' },
  ]
  constructor(private router: Router, private stepperService: Loanstepperservice, private route: ActivatedRoute, private loanformservice: Loanformservice) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];
        this.custName = params['custName'];
        this.custARN = params['custARN'];
        this.stepperService.setLoanId(this.applicantId, this.applicationId, this.custName, this.custARN);
      }
    });
  }

limitLoanAmount(event: any) {

  let value = event.target.value;
  if (!value) return;
  value = value.replace(/\D/g, ''); 
  let num = Number(value);
  if (num > 4500000) {
    num = 4500000;
  }

  if (num < 100000) {
    num = 100000;
  }

  this.loanAmount = num;
}
limitTenureAmount(event: any) {
  let value = event.target.value;
  if (!value) return;
  let num = Number(value);
  if (num > 7) {
    num = 7;
  }

  if (num < 1) {
    num = 1;
  }

  this.tenure = num;

}

  submitForm(data: NgForm) {

     if (!data.valid) {
      console.log("form invalid");
      return;
    }

    console.log(data);
    let input = {
      "annualIncome": data.value.annual_Income,
      "requestedAmount": data.value.loanamt,
      "interestRate": data.value.rate,
      "requestedTenureMonths": data.value.tenureInput*12,
      "modeOfPayment": data.value.paymentmode,
      "emiAmount": '',
      "totalInterest": '',
      "totalPrincipal": ''
    }

    console.log(input);

    this.loanformservice.submitLoanInfo(input, this.applicationId).subscribe({
      next: (data) => {
        console.log(data);
 if(data.status =="success"){

  this.stepperService.next();
 }

      },
      error: (error) => {
        console.log(error);
      }
    });

  }


 
}
