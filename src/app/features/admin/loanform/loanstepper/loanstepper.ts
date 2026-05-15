import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-loanstepper',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './loanstepper.html',
  styleUrl: './loanstepper.scss'
})
export class Loanstepper implements OnInit {
  steps: any;
  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';
  completedEducationSections: Set<string> = new Set();
  completedSteps: Set<number> = new Set();

  activeQualificationId!: any;


  constructor(public router: Router, public stepservice: Loanstepperservice, private route: ActivatedRoute, private stepperService: Loanstepperservice, private cdr: ChangeDetectorRef) {
    this.stepperService.steps$.subscribe(steps => {
      this.steps = steps;
      this.cdr.detectChanges(); // Force change detection
    });

    const saved = sessionStorage.getItem('completedEducationSections');
    if (saved) {
      this.completedEducationSections = new Set(JSON.parse(saved));
    }

  }


  ngOnInit() {
    this.steps = this.stepservice.steps;
    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];
        this.custName = params['custName'];
        this.custARN = params['custARN'];

        this.stepperService.setLoanId(this.applicantId, this.applicationId, this.custName, this.custARN);


        // this.route.queryParams.subscribe(params => {
        //   if (params['qualificationlabel']) {
        // this.activeQualificationId = params['qualificationlabel'] ?? undefined;
        this.activeQualificationId = this.normalizeQualification(
  params['qualificationlabel'] || ''
);
        //   }
        // });

      }

      if (params['qualificationlabel']) {
        // this.activeQualificationId = params['qualificationlabel'];
        this.activeQualificationId = this.normalizeQualification(
  params['qualificationlabel'] || ''
);
        this.cdr.detectChanges();
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

    //  if (this.stepservice.isStepCompleted(step.route)) {
    //     return true;
    //   }


    if (index === currentIdx) {
      return true;
    }

    return false;
  }
  canNavigateTo(index: number): boolean {
  const step = this.steps[index];

  // ✅ allow if completed
  if (this.stepservice.isStepCompleted(step.route)) {
    return true;
  }

  // ✅ allow current step
  if (index === this.currentIndex) {
    return true;
  }

  // ✅ allow next step ONLY if previous is completed
  const prevStep = this.steps[index - 1];
  if (prevStep && this.stepservice.isStepCompleted(prevStep.route)) {
    return true;
  }

  return false;
}


  goToStep(route: string, index: number) {
    if (this.canNavigateTo(index)) {
      console.log(` Navigating to ${route} (index ${index})`);
      this.router.navigate(['/loanform', route], {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      });
    } else {
      console.log(`Blocked navigation to index ${index}`);
    }
  }

  isNextStep(index: number): boolean {
    return index === this.currentIndex + 1;
  }

  isCompleted(index: number): boolean {
    const step = this.steps[index];
    return this.stepservice.isStepCompleted(step.route);
  }

  // In component.ts, temporarily add:
  isCompleted1(index: number): boolean {
    const result = index < this.currentIndex;
    return result;
  }

  isUpcoming(index: number): boolean {


    const step = this.steps[index];

    if (this.stepservice.isStepCompleted(step.route)) {
      return false;
    }

    return index > this.currentIndex;
  }

  isSubStepperDisabled1(parentIndex: number, subIndex: number): boolean {


    const parentStep = this.steps[parentIndex];
    if (!parentStep?.children) return false;


    const stepKey = this.normalizeQualification(
      parentStep.children[subIndex].label
    );


    if (this.stepperService.isEducationStepCompleted(stepKey)) {
      return false;
    }
    if (this.activeQualificationId === stepKey) {
      return false;
    }
    return true;


    // const activeIndex = parentStep.children.findIndex(
    //   (c: any) => this.normalizeQualification(c.label) === this.activeQualificationId
    // );

    // return subIndex > activeIndex;
  }

isSubStepperDisabled(parentIndex: number, subIndex: number): boolean {
  
  const parentStep = this.steps[parentIndex];
  if (!parentStep?.children) return false;

  const children = parentStep.children;

  // find active index
  const activeIndex = children.findIndex(
    // (c: any) => this.normalizeQualification(c.label) === this.activeQualificationId
    (c: any) => c.key === this.activeQualificationId
  );

  // ✅ allow all completed
  const stepKey = children[subIndex].key;

  if (this.stepperService.isEducationStepCompleted(stepKey)) {
    return false;
  }

if (activeIndex === -1) {
   return subIndex !== 0;
  }

  // ✅ allow current active
  if (subIndex === activeIndex) {
    return false;
  }

  // ✅ only allow previous ones
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


    // this.router.navigate([], {

    this.router.navigate(
      ['/loanform/educationinfo'],
      {

        // relativeTo: this.route,
        queryParams: {

          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN,
          qualificationlabel: stepKey,
          qualificationId: sub.id
        },
        queryParamsHandling: 'merge'
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
}