import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Route, Router } from '@angular/router';
import { TabConfig, TAB_CONFIG } from '../../../shared/config/tab.config';
import { AddCustomer } from '../customer/add-customer/add-customer';


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
  // links: any[] = [];
  links: Array<{
    label: string;
    route: string;
    tab: string;
    icon: string;
  }> = [];

  isExpanded = false;

  private PAGE_ROUTES = {
    losdetails: '/admin/losdetails',
    customerdetails: '/admin/customerdetails',
    coapplicantdetails: '/admin/coapplicantdetails',
    addcustomers: '/admin/customer/addcustomer'
  } as const;


  constructor(private router: Router) { }


  ngOnInit() {
    // show opposite page tabs
    // this.links = this.quickLinks.filter(
    //   link => link.page !== this.currentPage
    // );

     this.links = TAB_CONFIG
      .filter(tab => !tab.page.includes(this.currentPage))
      .map(tab => {
        const targetPage = tab.page.find(p => p !== this.currentPage)!;
        return {
          label: tab.label,
          icon: tab.icon,
          tab: tab.routeKey,
          route: this.PAGE_ROUTES[targetPage]
        };
      });
  }

  onLinkClick(link: { route: string; tab: string }) {
    this.router.navigate([link.route], {
      queryParams: { tab: link.tab }
    });
  }

  toggleQuickLinks() {
    this.isExpanded = !this.isExpanded;
  }


}
