import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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


  steps = [
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
  constructor(private router: Router, private route: ActivatedRoute, private stepperService: Loanstepperservice) {


    // this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
    //       const childPath = this.route.firstChild?.snapshot.url?.[0]?.path;
    //       const idx = this.steps.findIndex(s => s.route === childPath);
    //       this.currentIndex = idx >= 0 ? idx : 0;
    //     });

  }

  // get currentIndex(): number {
  //   const route = this.router.url.split('/').pop();
  //   return this.steps.findIndex(s => s.route === route);
  // }


  ngOnInit() {
    this.stepperService.setStepperType('CO_APPLICANT');
    this.steps = this.stepperService.steps;

    this.updateCurrentIndex();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentIndex();
      });
  }


  // goToStep(step: any, index: number) {
  //   this.router.navigate([ step.route],{ relativeTo: this.route });
  // }


  updateCurrentIndex() {
    const cleanUrl = this.router.url.split('?')[0];
    const lastSegment = cleanUrl.split('/').filter(Boolean).at(-1) || '';

    const idx = this.steps.findIndex(s => s.route === lastSegment);
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

  isCompleted(index: number) {
    return index < this.currentIndex;
  }
  canNavigate(i: number) {
    return i <= this.currentIndex;
  }


  ngOnDestroy() {
    // Important when leaving co-applicant flow
    this.stepperService.setStepperType('MAIN');
  }

}
