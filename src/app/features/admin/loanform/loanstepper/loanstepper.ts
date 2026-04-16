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


  constructor(public router: Router, public stepservice: Loanstepperservice,private route:ActivatedRoute,private stepperService:Loanstepperservice,private cdr: ChangeDetectorRef) {
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

        this.stepperService.setLoanId(this.applicantId, this.applicationId,this.custName,this.custARN);
      }
    });
  }

  get currentIndex(): number {
    const currentRoute = this.router.url.split('/').pop();
    return this.steps.findIndex((s: { route: string | undefined; }) => s.route === currentRoute);
  }
  isActive(route: string) {
    return this.router.url.includes(route);
  }

  // goToStep(route: string) {
  //   this.router.navigate(['/loanform', route]);
  // }


canNavigateTo(index: number): boolean {
  const currentIdx = this.currentIndex;
  return index <= currentIdx + 1;
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
    return index < this.currentIndex;
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
