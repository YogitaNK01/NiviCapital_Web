import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Loanstepperservice {
    private applicantId: string | null = null;

  steps = [
    { label: 'Loan Info', route: 'loaninfo' },
    { label: 'General Info', route: 'genralinfo' },
    { label: 'Estimated Expense', route: 'expense' },
    { label: 'Additional Info', route: 'additionalinfo' },
    { label: 'KYC', route: 'kycinfo' },
    { label: 'Education Details', route: 'educationinfo' },
    { label: 'Income Details', route: 'incomeinfo' },
    { label: 'Assets', route: 'asset' },
    { label: 'Liabilities', route: 'liability' },
    { label: 'Reference', route: 'reference' }
  ];


  constructor(private router: Router) {}


  setLoanId(id: string) {
    this.applicantId = id;
  }


  getLoanId() {
    return this.applicantId;
  }
  
  next() {
    const currentRoute = this.router.url.split('/').pop();

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index < this.steps.length - 1) {
      const nextRoute = this.steps[index + 1].route;
      this.router.navigate(['/loanform', nextRoute],{
          queryParams: { applicantId: this.applicantId } 
        });
    }
  }

  previous() {
    const currentRoute = this.router.url.split('/').pop();

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;
      this.router.navigate(['/loanform', prevRoute]);
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