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




  private educationSubStepsInitialized = false;

  private educationSubSteps: any[] = [];
  private completedEducationSections = new Set<string>();
  private completedSteps = new Set<string>();
  private formData: Record<string, any> = {};

  private stepsSubject = new BehaviorSubject<any[]>([]);
  public steps$ = this.stepsSubject.asObservable();

  private EDUCATION_PROGRESS_KEY = 'educationProgress';


  constructor(private formSvc: Loanformservice, private router: Router) {
    this.buildSteps();
    this.restoreEducationProgress();

    const saved = localStorage.getItem('coursetypeug');
    if (saved !== null) {
      this.coursetypeug = JSON.parse(saved);
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
      // { label: 'Co-Applicant', route: 'coapplicantinfo' },
      { label: 'Summary', route: 'summaryinfo' }
    ];
    // console.log('📋 Final Steps:', finalSteps);
    this.stepsSubject.next(finalSteps);

  }


  get steps(): Step[] {
    return this.stepsSubject.getValue();
  }

  //-----------education steps ----------------
  setEducationSubSteps(data: any[]) {


    // if (this.educationSubStepsInitialized) {
    //   return;
    // }

    this.educationSubSteps = data.map(d => ({
      id: d.qualificationId,
      label: d.qualificationName.includes('Others') ? d.qualificationName : d.qualificationName.split('(')[0].trim()
    }));

    this.educationSubSteps.push({ id: "0", label: "IELTS / PTE" })
    this.educationSubSteps.push({ id: "1", label: "University Offer Letter" })

    this.educationSubStepsInitialized = true;
    this.buildSteps();
  }

  markEducationSectionComplete(step: string) {
    this.completedEducationSections.add(step);
    // this.saveEducationProgress();
    sessionStorage.setItem(
      'completedEducationSections',
      JSON.stringify([...this.completedEducationSections])
    );

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
    sessionStorage.setItem(
      this.EDUCATION_PROGRESS_KEY,
      JSON.stringify([...this.completedEducationSections])
    );
  }

  private restoreEducationProgress() {
    const saved = sessionStorage.getItem(this.EDUCATION_PROGRESS_KEY);
    if (saved) {
      this.completedEducationSections = new Set(JSON.parse(saved));
    }
  }


  //---------------all other steps --------------

  markStepCompleted(route: string) {
    this.completedSteps.add(route);
  }

  isStepCompleted(route: string): boolean {
    return this.completedSteps.has(route);
  }

  setLoanId(id1: string, id2: string, name: string, arn: string) {
    this.applicantId = id1;
    this.applicationId = id2;
    this.custName = name;
    this.custARN = arn;
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

  next() {
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
  next1() {
    const currentRoute = this.router.url.split('?')[0].split('/').pop();;

    const index = this.steps.findIndex(s => s.route === currentRoute);


    if (currentRoute === 'educationinfo') {
      return; // stay on education section
    }

    if (index < this.steps.length - 1 && index !== -1) {
      const nextRoute = this.steps[index + 1].route;
      this.router.navigate(['/loanform', nextRoute], {
        queryParams: { applicantId: this.applicantId, applicationId: this.applicationId, custName: this.custName, custARN: this.custARN }
      });
    }
  }

  previous1() {
    const currentRoute = this.router.url.split('?')[0].split('/').pop();;

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;
      this.router.navigate(['/loanform', prevRoute], {
        queryParams: { applicantId: this.applicantId, applicationId: this.applicationId, custName: this.custName, custARN: this.custARN }
      });
    }
  }
  previous() {


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

}

