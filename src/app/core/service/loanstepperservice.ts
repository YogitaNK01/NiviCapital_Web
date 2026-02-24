import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Loanstepperservice {
  

  steps = [
    { label: 'Loan Info', route: 'loaninfo' },
    { label: 'General Info', route: 'genralinfo' },
    { label: 'Estimated Expense', route: 'expense' },
    { label: 'Additional Info', route: 'additionalinfo' },
    { label: 'KYC', route: 'kycinfo' },
    { label: 'Income Details', route: 'income' },
    { label: 'Assets', route: 'asset' },
    { label: 'Liabilities', route: 'liability' },
    { label: 'Reference', route: 'reference' }
  ];


  constructor(private router: Router) {}

  next() {
    const currentRoute = this.router.url.split('/').pop();

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index < this.steps.length - 1) {
      const nextRoute = this.steps[index + 1].route;
      this.router.navigate(['/loanform', nextRoute]);
    }
  }

  previous() {
    const currentRoute = this.router.url.split('/').pop();

    const index = this.steps.findIndex(s => s.route === currentRoute);

    if (index > 0) {
      const prevRoute = this.steps[index - 1].route;
      this.router.navigate(['/loanform', prevRoute]);
    }
  }

}
