import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Inputfield } from '../../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../../systemdesign/dropdown/dropdown';
import { AuditTrail } from '../../../customerdetails/customerdetails';

@Component({
  selector: 'app-audittrail',
  imports: [CommonModule,Inputfield,Dropdown],
  templateUrl: './audittrail.html',
  styleUrl: './audittrail.scss'
})
export class Audittrail implements OnInit {

  auditTrails: AuditTrail[] = [];
  filteredAuditTrails: AuditTrail[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'all';
  
  
     ngOnInit() {
   this.loadAuditTrails();
  }
  selectedOption2: string = '';
  myOptions2: DropdownOption[] = [
    { label: 'Loan', value: 'pdf', icon: '/assets/images/icons/note.svg' },
    { label: 'Forex', value: 'excel', icon: '/assets/images/icons/note.svg' },
    { label: 'Insurance', value: 'json', icon: '/assets/images/icons/note.svg' },
    { label: 'Others', value: 'others', icon: '/assets/images/icons/note.svg' }
  ];
  onSelectionChange2(value: string) {
    console.log('Selected:2', value);
  }

    loadAuditTrails() {
   
    this.auditTrails = [
      {
        date: new Date(),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Pending'
      },
      {
        date: new Date(),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Pending'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        time: '2:30 PM',
        action: 'PAN Card Verified',
        reference: 'Ref 28789 ABC 67455',
        status: 'Approved'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        time: '11:45 AM',
        action: 'Document Upload',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      }
    ];

    this.filteredAuditTrails = [...this.auditTrails];
  }

  filterAuditTrail() {
    let filtered = [...this.auditTrails];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(trail =>
        trail.action.toLowerCase().includes(query) ||
        trail.reference.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(trail =>
        trail.status.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }

    this.filteredAuditTrails = filtered;
  }

  getTodayTrails(): AuditTrail[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() === today.getTime();
    });
  }

  getYesterdayTrails(): AuditTrail[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() === yesterday.getTime();
    });
  }

  getEarlierTrails(): AuditTrail[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() < yesterday.getTime();
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    return `status-${statusLower}`;
  }

}
