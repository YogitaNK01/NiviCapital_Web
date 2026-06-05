import { Injectable } from '@angular/core';
import { TableColumn } from '../../features/systemdesign/tables/tables';
import { Main } from './main';


export interface StatusClass {
  text: string;
  class: string;
}

@Injectable({
  providedIn: 'root'
})
export class TableData {

  constructor(private mainService: Main) { }
  transformUserData(data: any[]): any[] {
    return data.map((item, index) => ({
      // id_data: index + 1,
      custId: item.custId ?? "-",
      firstName: item.firstName ?? "-",
      lastName: item.lastName ?? "-",
      mobile: (item.mobile) ?? "-",
      email: (item.email) ?? '-',
      kycStatus: item.kycStatus ?? "-",
      status: item.status ?? "-",
      userId: item.userId ?? "-",
      ncId: item.ncId ?? "-",
      loantype: item.loanType ?? "-",
      disbursedAmount: item.disbursedAmount ?? "-",
      outstandingBalance: item.outstandingBalance ?? "-",
      loanStatus: item.loanStatus ?? "-",
      // Id: item.id ?? "-"

      applicationId: item.applicationId ?? "-",
      arn: item.arn ?? "-",
      applicationStatus: item.applicationStatus ?? "-",
      currentApplicationStatus: item.currentApplicationStatus ?? "-",
      nextStage: item.nextStage ?? "-",
      applicantId: item.applicantId ?? "-",
    }));
  }

  /** Calculate KYC completion percentage **/
  calculateKycMetrics(data: any[], totalItems: number): number {
    const kycCompletedcount = (data as any[]).filter(item => item.kycStatus === 'VERIFIED').length;
    return Math.round((kycCompletedcount / totalItems) * 100) || 0;
  }

  /**
   * Format date array [year, month, day] to string YYYY-MM-DD
   */
  formatDateOnly(dateArr: number[] | null | undefined): string {
    if (!dateArr || dateArr.length < 3) return '-';
    const [y, m, d] = dateArr;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  /**
   * Get status display text and CSS class
   */
  getStatus_Class(status: string): StatusClass {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return { text: 'Verified', class: 'Completed' };
      case 'pending':
        return { text: 'Pending', class: 'Pending' };
      case 'active':
        return { text: 'Active', class: 'active' };

      case 'document issue':
        return { text: 'Document Issue', class: 'Document-Issue' };
      case 'not_started':
        return { text: 'Not Started', class: 'Not Started' };
      default:
        return { text: '-', class: '' };
    }
  }

  /**
   * Check if array has data
   */
  hasData(data: any): boolean {
    return Array.isArray(data) && data.length > 0;
  }

  /**
   * Get visible page numbers for pagination
   */
  getVisiblePages(currentPage: number, totalPages: number): (number | string)[] {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);

      if (currentPage > 4) pages.push('...');

      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  }

  /**
   * Filter data by search term across multiple fields
   */
  filterBySearch(data: any[], searchText: string, searchFields: string[]): any[] {
    if (!searchText) return data;

    const lowerSearchText = searchText.toLowerCase();
    return data.filter(item =>
      searchFields.some(field =>
        item[field]?.toString().toLowerCase().replace(/[\s,]/g, '').includes(lowerSearchText)
      )
    );
  }

  /**
   * Filter data by status
   */
  filterByStatus(data: any[], statusValue: string, statusMap: { [key: string]: string }): any[] {
    if (statusValue === 'All') {
      return data;
    }

    const apiStatus = statusMap[statusValue.toLowerCase()];
    if (!apiStatus) {
      return data;
    }

    return data.filter(item => item.kycStatus?.toLowerCase() === apiStatus);
  }
}
