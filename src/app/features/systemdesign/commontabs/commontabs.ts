import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';


export interface AppTab {
  id: string;
  label: string;
}

export const ALL_TABS: AppTab[] = [
  // Customer details
  { id: 'pi', label: 'PI' },
  { id: 'pii', label: 'PII' },
  { id: 'kyc', label: 'KYC Details' },
  { id: 'products', label: 'Products' },

  // LOS details
  { id: 'loan', label: 'Loan Details' },
  { id: 'education', label: 'Education' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'assets', label: 'Assets' }
];

@Component({
  selector: 'app-commontabs',
   standalone: true,
  imports: [CommonModule, MatTabsModule],
  templateUrl: './commontabs.html',
  styleUrl: './commontabs.scss'
})
export class Commontabs {

  @Input() tabs: AppTab[] = [];
  @Input() selectedIndex = 0;
  @Output() tabChange = new EventEmitter<AppTab>();
  
}
