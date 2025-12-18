import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Route, Router } from '@angular/router';


export interface QuickLink {
  label: string;
  route: string;
  tab: string;          // target tab id
  page: 'customerdetails' | 'losdetails';
}

@Component({
  selector: 'app-quicklinks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quicklinks.html',
  styleUrl: './quicklinks.scss'
})
export class Quicklinks implements OnInit {
  

  @Input() currentPage!: 'customerdetails' | 'losdetails';
  links: any[] = [];

  isExpanded = false;


  quickLinks = [
    // LOS details
    { label: 'Loan Details', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'loan', page: 'losdetails' },
    { label: 'Education', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'education', page: 'losdetails' },
    { label: 'Occupation', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'occupation', page: 'losdetails' },
    { label: 'Assets and Liabilities', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'assets', page: 'losdetails' },
    { label: 'Monthly Expenditure', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'expenditure', page: 'losdetails' },
    { label: 'Estimated Expense', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'estimate', page: 'losdetails' },
    { label: 'Products', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'products', page: 'losdetails' },
    { label: 'Credit Score', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'credit', page: 'losdetails' },
    { label: 'Co-Applicant Details', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'coapplicant', page: 'losdetails' },
    { label: 'Summary', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'summary', page: 'losdetails' },
    { label: 'Audit Trail', icon: '/assets/images/sidemenu/user.svg', route: '/admin/losdetails', tab: 'audit', page: 'losdetails' },

    // Customer details
    { label: 'PI', icon: '/assets/images/sidemenu/user.svg', route: '/admin/customerdetails', tab: 'pi', page: 'customerdetails' },
    { label: 'PII', icon: '/assets/images/sidemenu/user.svg', route: '/admin/customerdetails', tab: 'pii', page: 'customerdetails' },
    { label: 'KYC Details', icon: '/assets/images/sidemenu/user.svg', route: '/admin/customerdetails', tab: 'kyc', page: 'customerdetails' },
    { label: 'Products', icon: '/assets/images/sidemenu/user.svg', route: '/admin/customerdetails', tab: 'products', page: 'customerdetails' },
  ];
  constructor(private router: Router) { }


  ngOnInit() {
    // show opposite page tabs
    this.links = this.quickLinks.filter(
      link => link.page !== this.currentPage
    );
  }

  onLinkClick(link: any) {
    this.router.navigate([link.route], {
      queryParams: { tab: link.tab }
    });
  }




  toggleQuickLinks() {
    this.isExpanded = !this.isExpanded;
  }


}
