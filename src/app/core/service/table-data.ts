import { Injectable } from '@angular/core';
import { TableColumn } from '../../features/systemdesign/tables/tables';


export interface StatusClass {
  text: string;
  class: string;
}

@Injectable({
  providedIn: 'root'
})
export class TableData {

  /**  Transform raw user data to table format **/
  transformUserData(data: any[]): any[] {
    return data.map((item, index) => ({
      id_data: index + 1,
      CIFID: item.cif ?? "-",
      CustomerName: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ?? "-",
      mobile: item.phoneNumber ?? "-",
      email: item.email ?? '',
      kycStatus: item.kycStatus ?? "-",
      loanStatus: item.kycStatus ?? "-",
      registrationDate: this.formatDateOnly(item.createdDateTime) ?? "-",
      userId: item.userId ?? "-",
      Id: item.id ?? "-"
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
      case 'verified':
        return { text: 'Completed', class: 'Completed' };
      case 'pending':
        return { text: 'Pending', class: 'Pending' };
      case 'document issue':
        return { text: 'Document Issue', class: 'Document-Issue' };
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
        item[field]?.toString().toLowerCase().includes(lowerSearchText)
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
