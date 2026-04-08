import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Loanformservice } from '../service/loanformservice';
import { BehaviorSubject } from 'rxjs';

interface Step {
  label: string;
  route: string;
}
@Injectable({
  providedIn: 'root'
})
export class Loanstepperservice {
    private applicantId: string | null = null;
    private applicationId: string | null = null;
     private custName: string | null = null;
     private custARN: string | null = null;

    //  steps: any[] = [];

      private stepsSubject = new BehaviorSubject<any[]>([]);
  public steps$ = this.stepsSubject.asObservable();
     constructor(private formSvc: Loanformservice,private router: Router) {
   this.rebuildSteps();
}
 rebuildSteps() {
    this.buildSteps();
  }
 

private buildSteps() {
  
   const baseSteps : Step[] = [
    { label: 'Loan Info', route: 'loaninfo' },
    { label: 'General Info', route: 'genralinfo' },
    { label: 'Estimated Expense', route: 'expense' },
    { label: 'Additional Info', route: 'additionalinfo' },
    { label: 'KYC', route: 'kycinfo' },
    // { label: 'Education Details', route: 'educationinfo' },
    
  ];
 const conditionalSteps: { label: string; route: string }[] = [];
   if (this.formSvc.isincome) {
    conditionalSteps.push({ label: 'Income Details', route: 'incomeinfo' });
  }
  if (this.formSvc.isasset) {
    conditionalSteps.push({ label: 'Assets', route: 'assetsinfo' });
  }

   const finalSteps :  Step[] = [
      ...baseSteps,
      ...conditionalSteps,
      { label: 'Liabilities', route: 'liabilitiesinfo' },
      { label: 'Monthly Expenditure', route: 'monthlyexpinfo' },
      { label: 'Reference', route: 'referenceinfo' },
      { label: 'Co-Applicant', route: 'coapplicantinfo' },
      { label: 'Summary', route: 'summaryinfo' }
    ];
     console.log('📋 Final Steps:', finalSteps);
    this.stepsSubject.next(finalSteps);

  
  
}
get steps(): Step[] {
    return this.stepsSubject.getValue();
  }
  

  setLoanId(id1: string,id2: string,name:string,arn:string) {
    this.applicantId = id1;
     this.applicationId = id2;
     this.custName = name;
     this.custARN = arn;
     this.buildSteps();
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
//  steps1 = [
//     { label: 'Loan Info', route: 'loaninfo' },
    
//     { label: 'General Info', route: 'genralinfo' },
//     { label: 'Estimated Expense', route: 'expense' },
//     { label: 'Additional Info', route: 'additionalinfo' },
//     { label: 'KYC', route: 'kycinfo' },
//     { label: 'Education Details', route: 'educationinfo' },
//     { label: 'Income Details', route: 'incomeinfo' },
//     { label: 'Assets', route: 'assetsinfo' },
//     { label: 'Liabilities', route: 'liabilitiesinfo' },
//      { label: 'Monthly Expenditure', route: 'monthlyexpinfo' },
//     { label: 'Reference', route: 'referenceinfo' },
//      { label: 'Co-Applicant', route: 'coapplicantinfo' },
//       { label: 'Summary', route: 'summaryinfo' },
//   ];