import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Loanformservice } from '../../../../core/service/loanformservice';

@Component({
  selector: 'app-loanstepper',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './loanstepper.html',
  styleUrl: './loanstepper.scss'
})
export class Loanstepper implements OnInit {
  steps: any;
  applicantId:any;
  applicationId:any;
  custName:any;
  custARN:any;
  // completedEducationSections: Set<string> = new Set();
  completedSteps: Set<number> = new Set();

  activeQualificationId!: any;
  educationdetails: any;
  activeEducation: any;
  private flowQualificationId: string | null = null;



  constructor(public router: Router, public stepservice: Loanstepperservice, private route: ActivatedRoute, private stepperService: Loanstepperservice, private formSvc: Loanformservice, private cdr: ChangeDetectorRef) {
    this.stepperService.steps$.subscribe(steps => {
      this.steps = steps;
      this.cdr.detectChanges(); // Force change detection
    });

    // const saved = sessionStorage.getItem('completedEducationSections');


  }


  ngOnInit() {
    this.steps = this.stepservice.steps;

     let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    this.custName = Allids[2];
    this.custARN = Allids[3];

    this.route.queryParams.subscribe(params => {
      

      const label = params['qualificationlabel'];
      if (label) {
        this.activeEducation = label;
        this.cdr.detectChanges();
      }

      //  Only rebuild submenu if flow qualificationId changed
      const qid = params['qualificationId'];
      if (qid && qid !== this.flowQualificationId) {
        this.flowQualificationId = qid;

        this.formSvc.getselectedEducation(qid).subscribe(res => {
          this.educationdetails = res.data ?? res;

          //  build submenu ONCE for this flow
          this.stepperService.setEducationSubSteps(this.educationdetails);
        });
      }

    });
    this.router.events.subscribe(() => {
      // this.cdr.detectChanges(); 
      const cleanUrl = this.router.url.split('?')[0];
      if (!cleanUrl.includes('education')) {
        this.activeQualificationId = undefined;
        this.cdr.detectChanges();
      }

    });
    
// this.stepperService.restoreCompletedSteps(); 
  this.stepperService.rebuildSteps();

  }


  get currentIndex1(): number {
    try {
      const rawUrl = this.router.url;
      const pathOnly = rawUrl.split('?')[0];
      const segments = pathOnly.split('/').filter(seg => seg.length > 0);
      const currentRoute = segments[segments.length - 1];

      // console.log('Cleaned route:', currentRoute);

      const idx = this.steps?.findIndex((s: any) =>
        s.route === currentRoute ||
        s.route?.toLowerCase().includes(currentRoute.toLowerCase()) ||
        currentRoute.includes(s.route)
      ) ?? -1;

      return Math.max(idx, 0);
    } catch (e) {
      return 0;
    }
  }
  get currentIndex(): number {
    const cleanUrl = this.router.url.split('?')[0];
    const lastSegment = cleanUrl.split('/').pop();

    let logicalRoute = lastSegment;

    
if (cleanUrl.includes('co-applicantdetails')) {
    logicalRoute = 'co-applicantdetails';
  }

    // Treat education sub-pages as Education Details
    if (lastSegment === 'educationinfo') {
      logicalRoute = 'educationDetails';
    }

    const idx = this.steps.findIndex(
      (s: any) => s.route === logicalRoute
    );

    return idx >= 0 ? idx : 0;
  }



  isActive(route: string) {
    return this.router.url.includes(route);
  }


  canNavigateTo1(index: number): boolean {
    const currentIdx = this.currentIndex;
    const step = this.steps[index];
    if (this.isCompleted(index)) {
      return true;
    }



    if (index === currentIdx) {
      return true;
    }

    return false;
  }
  canNavigateTo(index: number): boolean {
    const step = this.steps[index];
  if (!step) return false;
    //  allow if completed
    // if (this.stepservice.isStepCompleted(step.route)) {
    //   return true;
    // }
    
 if (this.stepservice.isMainStepCompleted(step.route)) {
    return true;
  }


    //  allow current step
   if (index === this.currentIndex ) {
      return true;
    }

    //  allow next step ONLY if previous is completed
    const prevStep = this.steps[index - 1];
    // if (prevStep && this.stepservice.isStepCompleted(prevStep.route)) {
    //   return true;
    // }
    
 if (prevStep && this.stepservice.isMainStepCompleted(prevStep.route)) {
    return true;
  }


    return false;
  }


  goToStep1(route: string, index: number) {

    const step = this.steps[index];
this.stepperService.switchToMainApplicantFlow();
    //  If education step → go to active child
    if (route === 'educationDetails') {


      this.router.navigate(
        ['/loanform', 'educationDetails'],
        {
          queryParams: {
            applicantId: this.applicantId,
            applicationId: this.applicationId,
            custName: this.custName,
            custARN: this.custARN,
          },

          //  optional: remove child params so it never opens educationinfo
          queryParamsHandling: 'merge'
        }
      );

      return;

    }


    if (this.canNavigateTo(index)) {
      console.log(` Navigating to ${route} (index ${index})`);
      this.router.navigate(['/loanform', route], {
        queryParams: {
         
        }
      });
    } else {
      console.log(`Blocked navigation to index ${index}`);
    }
  }
goToStep(route: string, index: number) {
  if (!this.canNavigateTo(index)) {
    console.log(`Blocked navigation to index ${index}`);
    return;
  }

  // Important: if user clicks vertical stepper while inside co-applicant,
  // switch context back to MAIN applicant
  this.stepperService.switchToMainApplicantFlow();

  if (route === 'educationDetails') {
    this.router.navigate(['/loanform', 'educationDetails'], {
      queryParamsHandling: 'merge'
    });
    return;
  }

  this.router.navigate(['/loanform', route], {
    queryParamsHandling: 'merge'
  });
}
  isNextStep(index: number): boolean {
    return index === this.currentIndex + 1;
  }

  isCompleted(index: number): boolean {
    const step = this.steps[index];
    return this.stepservice.isMainStepCompleted(step.route);
  }

  // In component.ts, temporarily add:
 isCompleted1(index: number): boolean {
    const step = this.steps[index];
    return this.stepservice.isStepCompleted(step.route);
  }

  isUpcoming(index: number): boolean {


    const step = this.steps[index];
  if (!step) return false;
    if (this.stepservice.isMainStepCompleted(step.route)) {
      return false;
    }

    return index > this.currentIndex;
  }



  isSubStepperDisabled(parentIndex: number, subIndex: number): boolean {

    const parentStep = this.steps[parentIndex];
    if (!parentStep?.children) return false;

    const children = parentStep.children;

    // find active index
    const activeIndex = children.findIndex(
      (c: any) => c.key === this.activeQualificationId
    );

    //  allow all completed
    const stepKey = children[subIndex].key;

    if (this.stepperService.isEducationStepCompleted(stepKey)) {
      return false;
    }

    if (activeIndex === -1) {
      return subIndex !== 0;
    }

    //  allow current active
    if (subIndex === activeIndex) {
      return false;
    }

    //  only allow previous ones
    // return subIndex > activeIndex;


    if (subIndex < activeIndex) {
      return false;
    }

    //  Future steps → disabled
    return true;

  }

  openEducationSubStep(sub: any, event: Event) {
    event.stopPropagation();
    const stepKey = sub.key;
    this.activeQualificationId = stepKey;

    const flowQualificationId = this.route.snapshot.queryParams['qualificationId'];


    // this.router.navigate([], {

    this.router.navigate(
      // ['/loanform/educationinfo'],
      ['/loanform', 'educationDetails', 'educationinfo'],
      {

        // relativeTo: this.route,
        queryParams: {

          
          qualificationlabel: stepKey,
          qualificationId: flowQualificationId
          // qualificationId: sub.id
        },
        queryParamsHandling: 'merge'
      })
      .then(() => {
        this.activeQualificationId = stepKey;
      });


  }

  isInsideEducation(): boolean {
    return (
      this.router.url.includes('educationDetails') ||
      this.router.url.includes('educationinfo')
    );
  }

  normalizeQualification(name: string): string {
    const lower = name.toLowerCase();

    // School
    if (lower === '10th') return '10th';
    if (lower === '12th') return '12th';

    // Diploma
    // if (lower.includes('diploma') || lower.includes('diploma10') || (lower.includes('diploma') && lower.includes('10'))) return 'diploma10';
    // if (lower.includes('diploma') || lower.includes('diploma12') || (lower.includes('diploma') && lower.includes('12'))) return 'diploma12';
    //  if (lower.includes('diploma')) return 'diploma';

    //  Diploma AFTER 12th (check FIRST)
    if (lower.includes('diploma') && lower.includes('12')) {
      return 'diploma12';
    }

    //  Diploma AFTER 10th
    if (lower.includes('diploma') && lower.includes('10')) {
      return 'diploma10';
    }


    if (lower.includes('others') && lower.includes('after 12th')) return 'others12';
    if (lower.includes('others') && lower.includes('diploma')) return 'othersdiploma';

    // UG
    if (lower.includes('undergraduate')) return 'ug';
    // PG
    if (lower.includes('postgraduate')) return 'pg';

    // IELTS / PTE
    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';

    // Offer letter / Others
    if (lower.includes('offer')) return 'offerletter';
    if (lower.includes('others')) return 'others';

    // console.warn('Unknown qualification:', name);
    return 'others';
  }

  get completedEducationSections() {
    return this.stepservice.getCompletedEducationSections();
  }
}