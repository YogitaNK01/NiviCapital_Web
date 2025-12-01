import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quicklinks',
  imports: [CommonModule],
  templateUrl: './quicklinks.html',
  styleUrl: './quicklinks.scss'
})
export class Quicklinks {
 @Input() selectedTabIndex: number = 0;
  @Output() tabChange = new EventEmitter<number>();
  
  isExpanded = false;

  quickLinks = [
    { label: 'Education', icon: '/assets/images/icons/user.svg', tabIndex: 0, isActive: true },
    { label: 'Occupation', icon: '/assets/images/icons/shield.svg', tabIndex: 1, isActive: false },
    { label: 'Assets and Liabilities', icon: '/assets/images/icons/chart.svg', tabIndex: -1, isActive: false },
    { label: 'Monthly Expenditure', icon: '/assets/images/icons/calendar.svg', tabIndex: -1, isActive: false },
    { label: 'Estimated Expense', icon: '/assets/images/icons/document.svg', tabIndex: -1, isActive: false },
    { label: 'Products', icon: '/assets/images/icons/box.svg', tabIndex: 6, isActive: false },
    { label: 'Co-Applicant Details', icon: '/assets/images/icons/users.svg', tabIndex: -1, isActive: false },
    { label: 'Credit Score', icon: '/assets/images/icons/star.svg', tabIndex: 8, isActive: false }
  ];

  toggleQuickLinks() {
    this.isExpanded = !this.isExpanded;
  }

  onLinkClick(link: any) {
    // Update active state
    this.quickLinks.forEach(l => l.isActive = false);
    link.isActive = true;

    // Emit tab change if valid tab index
    if (link.tabIndex >= 0) {
      this.tabChange.emit(link.tabIndex);
    }

    // Optionally close the panel after selection
    // this.isExpanded = false;
  }

  ngOnChanges() {
    // Update active link based on selected tab
    this.quickLinks.forEach(link => {
      link.isActive = link.tabIndex === this.selectedTabIndex;
    });
  }
}
