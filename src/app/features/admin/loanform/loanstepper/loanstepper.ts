import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  constructor(public router: Router, public stepservice: Loanstepperservice,private route:ActivatedRoute,private stepperService:Loanstepperservice) {

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

  goToStep(route: string) {
    this.router.navigate(['/loanform', route]);
  }

  isCompleted(index: number): boolean {
    return index < this.currentIndex;
  }

  isUpcoming(index: number): boolean {
    return index > this.currentIndex;
  }


}
