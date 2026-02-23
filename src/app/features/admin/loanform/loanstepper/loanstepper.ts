import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-loanstepper',
  imports: [CommonModule,RouterModule],
  standalone:true,
  templateUrl: './loanstepper.html',
  styleUrl: './loanstepper.scss'
})
export class Loanstepper {

    steps = [
    { label: 'Loan Info', route: 'loaninfo' },
    { label: 'General Info', route: 'genralinfo' },
    { label: 'Estimated Expense', route: 'expense' },
    { label: 'KYC', route: 'kyc' },
    { label: 'Income Details', route: 'income' },
    { label: 'Assets', route: 'asset' },
    { label: 'Liabilities', route: 'liability' },
    { label: 'Reference', route: 'reference' }
  ];

   constructor(public router: Router) {}

  isActive(route: string) {
    return this.router.url.includes(route);
  }
}
