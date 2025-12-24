import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabGroup } from '@angular/material/tabs';


export interface AppTab {
  id: string;
  label: string;
}

export const ALL_TABS: AppTab[] = [
  //kyc
  { id: 'pi', label: 'PI' },
  { id: 'pii', label: 'PII' },
  { id: 'kyc', label: 'KYC Details' },
  { id: 'kyc-products', label: 'Products' },

  // LOS
  { id: 'loan', label: 'Loan Details' },
  { id: 'education', label: 'Education' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'assets', label: 'Assets & Liabilities' },
   { id: 'expenditure', label: 'Monthly Expenditure' },
  { id: 'estimate', label: 'Estimated Expense' },
  { id: 'los-products', label: 'Products' },
  { id: 'credit', label: 'Credit Score' },
  { id: 'coapplicant', label: 'Co-applicant' },
  { id: 'summary', label: 'Summary' },
  { id: 'audit', label: 'Audit Trail' }
];


@Component({
  selector: 'app-commontabs',
   standalone: true,
  imports: [CommonModule, MatTabsModule],
  templateUrl: './commontabs.html',
  styleUrl: './commontabs.scss'
})
export class Commontabs {
@ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  @Input() tabs: AppTab[] = [];
  @Input() selectedIndex = 0;
  @Output() tabChange = new EventEmitter<AppTab>();
  
}
