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

  completedSteps: Set<number> = new Set();

  activeQualificationId!: any;


  constructor(public router: Router, public stepservice: Loanstepperservice, private route: ActivatedRoute, private stepperService: Loanstepperservice, private cdr: ChangeDetectorRef) {
    this.stepperService.steps$.subscribe(steps => {
      this.steps = steps;
      this.cdr.detectChanges(); // Force change detection
    });
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
            this.activeQualificationId = params['qualificationlabel']?? undefined;
        //   }
        // });

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


  canNavigateTo(index: number): boolean {
    const currentIdx = this.currentIndex;

    if (this.isCompleted(index)) {
      return true;
    }

    if (index === currentIdx) {
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
  isCompleted1(index: number): boolean {
    return index < this.currentIndex;
  }
  // In component.ts, temporarily add:
  isCompleted(index: number): boolean {
    const result = index < this.currentIndex;
    // console.log(`Step ${index} [${this.steps[index]?.label}] completed: ${result} | Current Index: ${this.currentIndex}`);
    return result;
  }

  isUpcoming(index: number): boolean {
    return index > this.currentIndex;
  }

  isSubStepperDisabled(parentIndex: number, subIndex: number): boolean {
    // if (this.isUpcoming(parentIndex)) {
    //   return true;
    // }


    const parentStep = this.steps[parentIndex];
    if (!parentStep?.children) return false;


    const stepKey = this.normalizeQualification(
      parentStep.children[subIndex].label
    );

    
 if (!this.isInsideEducation()) {
    return true;
  }


 if (this.stepperService.isEducationStepCompleted(stepKey)) {
    return false;
  }

    return true;


    // const activeIndex = parentStep.children.findIndex(
    //   (c: any) => this.normalizeQualification(c.label) === this.activeQualificationId
    // );

    // return subIndex > activeIndex;
  }



  openEducationSubStep(sub: any, event: Event) {
    event.stopPropagation();
    const stepKey = this.normalizeQualification(sub.label);
    this.activeQualificationId = stepKey;


    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
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
    if (lower.includes('diploma') || (lower.includes('diploma') && lower.includes('10'))) return 'diploma10';
    if (lower.includes('diploma') || (lower.includes('diploma') && lower.includes('12'))) return 'diploma12';

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