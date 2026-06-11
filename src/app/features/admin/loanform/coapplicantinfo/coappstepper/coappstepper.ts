import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-coappstepper',
  imports: [CommonModule, RouterOutlet],
  standalone: true,
  templateUrl: './coappstepper.html',
  styleUrl: './coappstepper.scss'
})
export class Coappstepper implements OnInit, OnDestroy {

  steps: any;
  steps1 = [
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
  currentIndex = 0;
  coApplicantIndex: any;
  constructor(private router: Router, private route: ActivatedRoute, private stepperService: Loanstepperservice, private cdr: ChangeDetectorRef) {

    this.stepperService.coSteps$.subscribe(steps => {
      this.steps = steps;
      this.cdr.detectChanges(); // Force change detection
    });

  }



  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.coApplicantIndex = params['coApplicantIndex'] || 1;

    this.stepperService.setCurrentCoApplicantIndex(this.coApplicantIndex);
    this.stepperService.setStepperType('CO_APPLICANT');



    this.stepperService.restoreCompletedSteps();
    this.stepperService.rebuildSteps();
    this.steps = this.stepperService.coSteps; // get co-applicant steps from service

    this.updateCurrentIndex();
    this.cdr.detectChanges();


    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const qp = this.route.snapshot.queryParams;
        const newIndex = qp['coApplicantIndex'] || 1;

        if (Number(newIndex) !== Number(this.coApplicantIndex)) {
          this.coApplicantIndex = newIndex;
          this.stepperService.setCurrentCoApplicantIndex(this.coApplicantIndex);
          this.stepperService.restoreCompletedSteps();
          this.stepperService.rebuildSteps();
          this.steps = this.stepperService.coSteps;
        }

        this.updateCurrentIndex();
        this.cdr.detectChanges();
      });

  }





  updateCurrentIndex() {
    const cleanUrl = this.router.url.split('?')[0];
    const lastSegment = cleanUrl.split('/').filter(Boolean).at(-1) || '';

    const idx = this.steps.findIndex((s: any) => s.route === lastSegment);
    this.currentIndex = idx >= 0 ? idx : 0;
  }

  goToStep(step: any, index: number) {
    if (!this.canNavigate(index)) return;

    this.router.navigate([step.route], {
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }


  isActive(index: number) {
    return index === this.currentIndex;
  }

  isCompleted1(index: number) {
    return index < this.currentIndex;
  }

  isCompleted(index: number): boolean {
    const step = this.steps[index];

    if (!step) {
      return false;
    }

    return this.stepperService.isCoApplicantStepCompleted(step.route);
  }

  isUpcoming(index: number): boolean {
    const step = this.steps[index];

    if (!step) {
      return false;
    }

    if (this.isCompleted(index)) {
      return false;
    }

    if (this.isActive(index)) {
      return false;
    }

    return !this.canNavigate(index);
  }


  canNavigate1(index: number): boolean {
    const step = this.steps[index];

    if (!step) {
      return false;
    }
    if (index === 0) {
      return true;
    }

    if (this.stepperService.isCoApplicantStepCompleted(step.route)) {
      return true;
    }

    if (index === this.currentIndex) {
      return true;
    }

    const prevStep = this.steps[index - 1];

    if (prevStep && this.stepperService.isCoApplicantStepCompleted(prevStep.route)) {
      return true;
    }

    return false;
  }
  canNavigate(index: number): boolean {
    const step = this.steps[index];
    if (!step) return false;

    // first step always allowed
    if (index === 0) return true;

    // current step always allowed
    if (index === this.currentIndex) return true;

    // completed step always allowed
    if (this.isCompleted(index)) return true;

    // previous step completed => allow next step
    const prevStep = this.steps[index - 1];
    if (prevStep && this.isCompleted(index - 1)) {
      return true;
    }

    return false;
  }


  ngOnDestroy() {
    // Important when leaving co-applicant flow
    this.stepperService.setStepperType('MAIN');
  }

}
