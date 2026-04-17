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

  activeQualificationId!: string;


  constructor(public router: Router, public stepservice: Loanstepperservice, private route: ActivatedRoute, private stepperService: Loanstepperservice, private cdr: ChangeDetectorRef) {
    this.stepperService.steps$.subscribe(steps => {
      this.steps = steps;
      this.cdr.detectChanges(); // ✅ Force change detection
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
      }
    });
    this.router.events.subscribe(() => {
      this.cdr.detectChanges(); // Trigger re-render on navigation
    });
  }

  get currentIndex1(): number {
    const currentRoute = this.router.url.split('/').pop();
    return this.steps.findIndex((s: { route: string | undefined; }) => s.route === currentRoute);
  }
  // You need this getter in TS:
  get currentIndex(): number {
    try {
      const rawUrl = this.router.url;
      const pathOnly = rawUrl.split('?')[0];
      const segments = pathOnly.split('/').filter(seg => seg.length > 0);
      const currentRoute = segments[segments.length - 1];

      // console.log('Cleaned route:', currentRoute);

      // Find matching step index
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

  isActive(route: string) {
    return this.router.url.includes(route);
  }

  // goToStep(route: string) {
  //   this.router.navigate(['/loanform', route]);
  // }


  canNavigateTo1(index: number): boolean {
    const currentIdx = this.currentIndex;
    return index <= currentIdx + 1;
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


  openEducationSubStep(sub: any, event: Event) {
    event.stopPropagation();

    this.activeQualificationId = sub.id;

    this.router.navigate(['/loanform/educationinfo'], {
      queryParams: {
        applicantId: this.applicantId,
        applicationId: this.applicationId,
        custName: this.custName,
        custARN: this.custARN,
        qualificationId: sub.id
      }
    });
  }


}
