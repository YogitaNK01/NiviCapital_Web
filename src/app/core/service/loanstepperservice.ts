import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Loanstepperservice {
    private applicantId: string | null = null;
    private applicationId: string | null = null;
     private custName: string | null = null;
     private custARN: string | null = null;

  steps = [
    { label: 'Loan Info', route: 'loaninfo' },
    { label: 'General Info', route: 'genralinfo' },
    { label: 'Estimated Expense', route: 'expense' },
    { label: 'Additional Info', route: 'additionalinfo' },
    { label: 'KYC', route: 'kycinfo' },
    { label: 'Education Details', route: 'educationinfo' },
    { label: 'Income Details', route: 'incomeinfo' },
    { label: 'Assets', route: 'assetsinfo' },
    { label: 'Liabilities', route: 'liabilitiesinfo' },
     { label: 'Monthly Expenditure', route: 'monthlyexpinfo' },
    { label: 'Reference', route: 'referenceinfo' },
     { label: 'Co-Applicant', route: 'coapplicantinfo' },
      { label: 'Summary', route: 'summaryinfo' },
  ];

  

  constructor(private router: Router) {}


  setLoanId(id1: string,id2: string,name:string,arn:string) {
    this.applicantId = id1;
     this.applicationId = id2;
     this.custName = name;
     this.custARN = arn;
  }


  getLoanId() {
    return [this.applicantId, this.applicationId,this.custName,this.custARN];
  }
  
  next() {
    const currentRoute = this.router.url.split('?')[0].split('/').pop();;

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index < this.steps.length - 1  && index !== -1) {
      const nextRoute = this.steps[index + 1].route;
      this.router.navigate(['/loanform', nextRoute],{
          queryParams: { applicantId: this.applicantId, applicationId: this.applicationId ,custName: this.custName,custARN: this.custARN} 
        });
    }
  }

  previous() {
    const currentRoute = this.router.url.split('?')[0].split('/').pop();;

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;
      this.router.navigate(['/loanform', prevRoute],{
          queryParams: { applicantId: this.applicantId, applicationId: this.applicationId,custName: this.custName,custARN: this.custARN} 
        });
    }
  }

  private formData: any = {};

  setStepData(step: string, data: any) {
    this.formData[step] = data;
  }

  getStepData(step: string) {
    return this.formData[step];
  }

  getAllData() {
    return this.formData;
  }

  clear() {
    this.formData = {};
  }

}

// last componet submit
// submitFinal() {

//   const allData = this.stepperFormService.getAllData();

//   console.log('All Steps Data:', allData);

  
// }