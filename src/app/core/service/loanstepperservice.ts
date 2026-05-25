import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Loanformservice } from '../service/loanformservice';
import { BehaviorSubject } from 'rxjs';
import { ShowOnDirtyErrorStateMatcher } from '@angular/material/core';

interface Step {
  label: string;
  route: string;

  children?: {
    id: string;
    label: string;
  }[];

}
type StepperType = 'MAIN' | 'CO_APPLICANT';

@Injectable({
  providedIn: 'root'
})
export class Loanstepperservice {
  private applicantId: string | null = null;
  private applicationId: string | null = null;
  private custName: string | null = null;
  private custARN: string | null = null;

  isasset: boolean = false;
  isincome: boolean = false;
  issalaried: boolean = false;
  coursetypeug: boolean = false;

  


private stepperType: StepperType = 'MAIN';


  private educationSubStepsInitialized = false;

  private educationSubSteps: any[] = [];
  private completedEducationSections = new Set<string>();
  private completedSteps = new Set<string>();
  private formData: Record<string, any> = {};

  private stepsSubject = new BehaviorSubject<any[]>([]);
  public steps$ = this.stepsSubject.asObservable();

  private EDUCATION_PROGRESS_KEY = 'educationProgress';

  private completedStepsKey = 'loan_completed_steps';


  constructor(private formSvc: Loanformservice, private router: Router) {
    this.buildSteps();


    const saved = localStorage.getItem('coursetypeug');
    if (saved !== null) {
      this.coursetypeug = JSON.parse(saved);
    }

    // const saved1 = localStorage.getItem(`completedSteps_${this.applicantId}`);
    
  const saved1 = localStorage.getItem(this.completedStepsKey);

    if (saved1) {
      this.completedSteps = new Set(JSON.parse(saved1));
    }


  }
  rebuildSteps() {
    this.buildSteps();
  }


  private buildSteps() {

    const baseSteps: Step[] = [
      { label: 'Loan Info', route: 'loaninfo' },
      { label: 'General Info', route: 'genralinfo' },
      //   {
      //   label: 'Education Details',
      //   route: 'educationDetails',
      //   children: this.educationSubSteps
      // },
      { label: 'Estimated Expense', route: 'expense' },
      { label: 'Additional Info', route: 'additionalinfo' },
      { label: 'KYC', route: 'kycinfo' },

      {
        label: 'Education Details',
        route: 'educationDetails',
        children: this.educationSubSteps
      },


    ];
    const conditionalSteps: { label: string; route: string }[] = [];
    if (this.formSvc.isincome) {
      conditionalSteps.push({ label: 'Income Details', route: 'incomeinfo' });
    }
    if (this.formSvc.isasset) {
      conditionalSteps.push({ label: 'Assets', route: 'assetsinfo' });
    }

    const finalSteps: Step[] = [
      ...baseSteps,
      ...conditionalSteps,
      { label: 'Liabilities', route: 'liabilitiesinfo' },
      { label: 'Monthly Expenditure', route: 'monthlyexpinfo' },
      { label: 'Reference', route: 'referenceinfo' },
      // { label: 'Co-Applicant', route: 'Coappdashboard' },
      { label: 'Summary', route: 'summaryinfo' }
    ];
    
    this.stepsSubject.next(finalSteps);

  }


  // get steps(): Step[] {
  //   return this.stepsSubject.getValue();
  // }

  get steps(): Step[] {
  return this.stepperType === 'CO_APPLICANT'
    ? this.coAppSteps
    : this.stepsSubject.getValue();
}

setStepperType(type: StepperType) {
  this.stepperType = type;
}

  //-----------education steps ----------------
  setEducationSubSteps(data: any[]) {


    this.educationSubSteps = data.map(d => {
      const name = d.qualificationName.toLowerCase();

      let key = '';

      if (name.includes('diploma') && name.includes('10')) {
        key = 'diploma10';
      } else if (name.includes('diploma') && name.includes('12')) {
        key = 'diploma12';
      } else if (name.includes('10th')) {
        key = '10th';
      } else if (name.includes('12th')) {
        key = '12th';
      }
      else if (name.includes('others') && name.includes('12')) {
        key = 'others12';

      }
      else if (name.includes('others') && name.includes('diploma')) {
        key = 'othersdiploma';

      }
      else if (name.includes('undergraduate')) {
        key = 'ug';

      }
      else if (name.includes('postgraduate')) {
        key = 'pg';

      }

      return {
        id: d.qualificationId,
        label: d.qualificationName.split('(')[0].trim(), // UI label
        key: key || d.qualificationName
      };
    });

    this.educationSubSteps.push({ id: "0", label: "IELTS / PTE", key: "ielts" })
    this.educationSubSteps.push({ id: "1", label: "University Offer Letter", key: "offerletter" })

    this.educationSubStepsInitialized = true;
    this.buildSteps();
  }


  private getEducationProgressKey(): string {
    return `educationProgress_${this.applicantId}`;
  }

  markEducationSectionComplete(step: string) {
    this.completedEducationSections.add(step);
   

    if (this.applicantId) {
      localStorage.setItem(
        this.getEducationProgressKey(),
        JSON.stringify([...this.completedEducationSections])
      );
    }

  }
  private restoreEducationProgress() {
    if (!this.applicantId) return;

    const saved = localStorage.getItem(this.getEducationProgressKey());

    if (saved) {
      this.completedEducationSections = new Set(JSON.parse(saved));
    } else {
      this.completedEducationSections = new Set();
    }
  }


  getCompletedEducationSections(): Set<string> {
    return this.completedEducationSections;
  }


  setEducationStepData(step: string, data: any) {
    this.formData[step] = data;
  }

  getEducationStepData(step: string) {
    return this.formData[step] ?? null;
  }

  isEducationStepCompleted(step: string): boolean {
    return this.completedEducationSections.has(step);
  }


  private saveEducationProgress() {
    localStorage.setItem(
      this.getEducationProgressKey(),
      JSON.stringify([...this.completedEducationSections])
    );
  }




  //---------------all other steps --------------

  private getCompletedStepsKey(): string {
    // return `completedSteps_${this.applicantId}`;
    return `${this.stepperType}_completedSteps_${this.applicantId}`;
  }

  markStepCompleted(route: string) {
    this.completedSteps.add(route);
    const key = `completedSteps_${this.applicantId}`;


    if (this.applicantId) {
      localStorage.setItem(
        this.getCompletedStepsKey(),
        JSON.stringify([...this.completedSteps])
      );
    }

    this.buildSteps();


  }
  restoreCompletedSteps() {
    if (!this.applicantId) return;

    const saved = localStorage.getItem(this.getCompletedStepsKey());

    if (saved) {
      this.completedSteps = new Set(JSON.parse(saved));
    } else {
      //this
    }
  }

  isStepCompleted(route: string): boolean {
    return this.completedSteps.has(route);
  }

  setLoanId(id1: string, id2: string, name: string, arn: string) {
    this.applicantId = id1;
    this.applicationId = id2;
    this.custName = name;
    this.custARN = arn;
    this.restoreEducationProgress();
    this.buildSteps();
  }


  getLoanId() {
    return [this.applicantId, this.applicationId, this.custName, this.custARN];
  }

  setvalues(isAsset?: boolean, isIncome?: boolean, issalaried?: boolean, coursetypeug?: boolean) {
    this.formSvc.setValues(isAsset, isIncome, issalaried, coursetypeug);
    this.buildSteps();
  }

  getvalues() {
    return { isAsset: this.formSvc.isasset, isIncome: this.formSvc.isincome, issalaried: this.formSvc.issalaried, coursetypeug: this.formSvc.coursetypeug };
  }

  next1() {
    const cleanUrl = this.router.url.split('?')[0];
    const lastSegment = cleanUrl.split('/').pop(); // could be 'educationinfo', 'educationDetails', etc.

    // If you are inside education child route, treat current step as 'educationDetails'
    const currentStepRoute = lastSegment === 'educationinfo' ? 'educationDetails' : lastSegment;

    const index = this.steps.findIndex(s => s.route === currentStepRoute);
    if (index === -1) return;

    if (index < this.steps.length - 1) {
      const nextRoute = this.steps[index + 1].route;
      this.router.navigate(['/loanform', nextRoute], {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      });
    }
  }
  
next() {
    const cleanUrl = this.router.url.split('?')[0];
    
  const segments = cleanUrl.split('/').filter(Boolean);
  let lastSegment = segments.at(-1) || '';

  let currentStepRoute = lastSegment;

  
 if (lastSegment === 'educationinfo') {
    currentStepRoute = 'educationDetails';
  }

  //  Co-applicant child route case: /coapplicantinfo/co-basicinfo
  // if (lastSegment.startsWith('co-')) {
  //   lastSegment = segments.at(-2) || lastSegment; //  'coapplicantinfo'
  // }



    const routeMap: Record<string, string> = {
  educationinfo: 'educationDetails',
  coapplicantinfo: 'co-applicantdetails'
};

// const currentStepRoute = routeMap[lastSegment] || lastSegment;

  const steps = this.steps; 


    const index1 = this.steps.findIndex(s => s.route === currentStepRoute);
    const index = steps.findIndex(s => s.route === currentStepRoute);
    if (index === -1) return;

    if (index < this.steps.length - 1) {
      const nextRoute = this.steps[index + 1].route;

      
const basePath =
      this.stepperType === 'CO_APPLICANT'
        ? ['/loanform', 'co-applicantdetails', 'coapplicantinfo']
        : ['/loanform'];


      // this.router.navigate(['/loanform', nextRoute], {
         this.router.navigate([...basePath, nextRoute], {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      });
    }
  }
  
  previous1() {


    const cleanUrl = this.router.url.split('?')[0];
    const lastSegment = cleanUrl.split('/').pop();
    const currentStepRoute = (lastSegment === 'educationinfo' || lastSegment === 'edusection') ? 'educationDetails' : lastSegment;

    const steps = this.stepsSubject.getValue();   // IMPORTANT
    const index = steps.findIndex(s => s.route === currentStepRoute);
    if (index === -1) return;


    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;
      this.router.navigate(['/loanform', prevRoute], {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      });
    }
  }

previous() {


    const cleanUrl = this.router.url.split('?')[0];
   
 const segments = cleanUrl.split('/').filter(Boolean);
  const lastSegment = segments.at(-1) || '';


 
  let currentStepRoute = lastSegment;

  // MAIN education child route
  if (lastSegment === 'educationinfo') {
    currentStepRoute = 'educationDetails';
  }


    const steps = this.steps;

  
    // const steps = this.stepsSubject.getValue();   
    const index = steps.findIndex(s => s.route === currentStepRoute);
    if (index === -1) return;


    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;

      
 const basePath =
      this.stepperType === 'CO_APPLICANT'
        ? ['/loanform', 'co-applicantdetails', 'coapplicantinfo']
        : ['/loanform'];


      // this.router.navigate(['/loanform', prevRoute], {
        this.router.navigate([...basePath, prevRoute], {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      });
    }
    
 else if (this.stepperType === 'CO_APPLICANT') {
    // ✅ go back to mobile screen when at first step
      this.router.navigate(['/loanform', 'co-applicantdetails'], {
      queryParams: {
        applicantId: this.applicantId,
        applicationId: this.applicationId,
custName: this.custName,
        custARN: this.custARN

      }
    });
  }

  }
  resetEducationSubSteps() {
    this.educationSubSteps = [];
    this.educationSubStepsInitialized = false;
    this.buildSteps();
  }

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
// -------------------co applicant-----------------------------

private coAppSteps: Step[] = [
  { label: 'Basic Info', route: 'co-basicinfo' },
  { label: 'General Info', route: 'co-generalinfo' },
  { label: 'Additional Info', route: 'co-additionalinfo' },
   { label: 'KYC', route: 'co-kyc' },
  { label: 'Income Details', route: 'co-incomeinfo' },
  { label: 'Assets', route: 'co-assetsinfo' },
  { label: 'Liabilities', route: 'co-liabilitiesinfo' },
  { label: 'Monthly Expenditure', route: 'co-monthlyexpinfo' },
  { label: 'Summary', route: 'co-summaryinfo' }
];








}

