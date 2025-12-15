import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Quicklinks } from '../quicklinks/quicklinks';
import { Sanctionletter } from '../sanctionletter/sanctionletter';
import { Router } from '@angular/router';
import { Main } from '../../../core/service/main';
import { Aesutil } from '../../../utils/aesutil';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { AuditTrail } from '../customerdetails/customerdetails';
import { Checkbox } from '../../systemdesign/checkbox/checkbox';
import { Radiobuttons } from '../../systemdesign/radiobuttons/radiobuttons';


interface CreditStats {
  totalCredit: string;
  totalAccounts: number;
  numberOfLoans: number;
  outstandingAmount: string;
}

interface Address {
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

interface CibilHistory {
  dateGenerated: string;
  name: string;
  generatedBy: string;
  creditScore: number;
}

@Component({
  selector: 'app-los-details',
  imports: [CommonModule, MatTabsModule, MatIconModule, Buttons, Inputfield, Dropdown, Checkbox, Radiobuttons],
  standalone: true,
  templateUrl: './los-details.html',
  styleUrl: './los-details.scss'
})
export class LosDetails {

  selectedTabIndex = 0;
  userData: any;
  kycData: any;
  issalaried: Boolean = false;

  kyc_documents: any[] = [];
  edu_documents: any[] = [];
  allApplicants: any[] = [];
  selecteduser: any;
  selectedDoc: any = null;

  tenthMarksheet: any;
  tenthLC: any;
  twelthMarksheet: any;
  twelfthLC: any;
  ugMarksheet: any;
  ugLC: any;
  pgMarksheet: any;
  pgLC: any;
  pgCert: any;
  scorecard: any;
  uniofferletter: any;
  salaryslip1: any;
  salaryslip2: any;
  salaryslip3: any;
  form16: any;
  itr1: any
  itr2: any;
  itr3: any;
  bankstatement: any;
  ielts: any


  auditTrails: AuditTrail[] = [];
  filteredAuditTrails: AuditTrail[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'all';

  isChecked = false;
  checkselectedOption_rb = 'option2';
  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gaugeCanvasrisk', { static: false }) gaugeCanvasrisk!: ElementRef<HTMLCanvasElement>;


  @Input() creditScore = 780;

  gaugeLabels = [
    { title: 'POOR', range: '300–550' },
    { title: 'AVERAGE', range: '550–650' },
    { title: 'GOOD', range: '650–750' },
    { title: 'EXCELLENT', range: '750–900' }
  ];

  gaugeLabelsrisk = [
    { title: 'LOW', range: '0-30%' },
    { title: 'MEDIUM', range: '31-60%' },
    { title: 'HIGH', range: '61-100%' },

  ];
  // creditScore: number = 780;
  reportDate: string = '20-06-2025';
  source: string = 'TransUnion CIBIL';

  creditStats: CreditStats = {
    totalCredit: '₹12,50,00',
    totalAccounts: 3,
    numberOfLoans: 4,
    outstandingAmount: '₹6,75,000'
  };



  cibilHistory: CibilHistory[] = [
    { dateGenerated: '25/07/2025', name: 'Vighnesh', generatedBy: 'Sandeep', creditScore: 780 },
    { dateGenerated: '22/11/2024', name: 'Vighnesh', generatedBy: 'Aarti', creditScore: 820 },
    { dateGenerated: '04/05/2024', name: 'Vighnesh', generatedBy: 'Priya', creditScore: 690 }
  ];

  //loan details--------------

  loanDetails = {
    loanAmount: { inr: '₹15,00,000', usd: '$25829' },
    rateOfInterest: '8.5% p.a.',
    tenure: { years: '5 years', months: '(60 months)' },
    monthlyEmi: { inr: '₹30,891', usd: '$537' },
    totalPayable: { inr: '₹23,53,460', usd: '$6037' },
    charges: { inr: '₹15,000', usd: '$256' },
    category: 'Gold'
  };

  riskFactors = [
    { icon: 'trending-up', label: 'CIBIL Score', value: '735 (Good)', status: 'success' },
    { icon: 'square', label: 'Repayment Capacity', value: '735 (Good)', status: 'success' },
    { icon: 'warning', label: 'Co-applicant Dependency', value: '40% reliance', status: 'warning' },
    { icon: 'check', label: 'Payment History', value: 'No defaults', status: 'success' }
  ];

  loanalerts = [
    {
      icon: '/assets/images/icons/danger.svg',
      type: 'danger',
      message: 'High debt-to-income ratio detected (65%). Recommended maximum is 50%.'
    },
    {
      icon: '/assets/images/icons/clock.svg',
      type: 'warning',
      message: "Co-applicant's income verification pending for final approval."
    }
  ];

  loancreditScore = {
    score: 780,
    rating: 'Excellent',
    date: '25-06-25',
    details: [
      { label: 'Total Credit', value: '₹12,50,000' },
      { label: 'Total Accounts', value: '3' },
      { label: 'Number of Loans', value: '4' },
      { label: 'Outstanding Credit Amount', value: '₹6,75,000' }
    ]
  };

  recommendations = [
    {
      icon: '/assets/images/icons/money-send.svg',
      title: 'Loan Amount Optimization',
      current: '₹15,00,000',
      recommended: '₹13,26,000',
      description: 'Reducing loan amount by 14.7% can improve approval chances and reduce repayment burden significantly.',
      borderClass: 'success',
      textcolor: 'text-success'
    },
    {
      icon: '/assets/images/icons/group.svg',
      title: 'Interest Rate Adjustment',
      current: '8.5% p.a.',
      recommended: '7.8% p.a.',
      description: 'Based on credit profile, the applicant qualifies for a lower interest rate, saving ₹30k overall.',
      borderClass: 'info',
      textcolor: 'text-info'
    },

    {
      icon: '/assets/images/icons/calendar.svg',
      title: 'Tenure Extension',
      current: '5 years',
      recommended: '7 years',
      description: 'Extending tenure reduces monthly EMI burden from ₹30,891 to ₹23,434, improving repayment capacity by 24%.',
      borderClass: 'warning',
      textcolor: 'text-warning'
    }
  ];


  constructor(public router: Router, private aes: Aesutil, private service: Main) { }

  async ngOnInit(): Promise<void> {
    console.log("loaded data")
    const saved = localStorage.getItem('selecteduserDetails');
    this.userData = saved ? JSON.parse(saved) : null;
    this.getAllDocumnets();
    this.loadAuditTrails();


  }


  getAllDocumnets() {
    this.service.getUserDocuments(this.service.docofselectedUser.id).subscribe({
      next: (response) => {

        this.edu_documents = response.documents;
        console.log('all Documents:', this.edu_documents);

        //10th
        this.tenthMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === '10th' && d.type === 'MARKSHEET'
        );
        console.log('all tenthMarksheet:', this.tenthMarksheet);

        this.tenthLC = this.edu_documents.find(
          d => d.documentSubcategory === '10th' && d.type === 'LC'
        );

        //12th
        this.twelthMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === '12th' && d.type === 'MARKSHEET'
        );
        this.twelfthLC = this.edu_documents.find(
          d => d.documentSubcategory === '12th' && d.type === 'LC'
        );

        //UG
        this.ugMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === 'undergrad' && d.type === 'MARKSHEET'
        );

        this.ugLC = this.edu_documents.find(
          d => d.documentSubcategory === 'undergrad' && d.type === 'MARKSHEET'
        );

        //PG
        this.pgMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === 'postgrad' && d.type === 'MARKSHEET'
        );
        this.pgCert = this.edu_documents.find(
          d => d.documentSubcategory === 'postgrad' && d.type === 'CERTIFICATE'
        );

        //scorecard 
        this.scorecard = this.edu_documents.find(
          d => d.documentSubcategory === 'ielts' && d.type === 'SCOREREPORT'
        );
        //offer letter
        this.uniofferletter = this.edu_documents.find(
          d => d.documentSubcategory === 'universityOffer' && d.type === 'UNIVERSITYOFFERLETTER'
        );

        //salaryslips
        this.salaryslip1 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip1'
        );
        this.salaryslip2 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip2'
        );
        this.salaryslip3 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip3'
        );

        //itr
        this.itr1 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr1'
        );
        this.itr2 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr2'
        );
        this.itr3 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr3'
        );

        //form16
        this.form16 = this.edu_documents.find(
          d => d.documentSubcategory === 'form16' && d.type === 'Form16'
        );

        //bankstatement
        this.bankstatement = this.edu_documents.find(
          d => d.documentSubcategory === 'statement' && d.type === 'BankStatement'
        );

        //ielts
        //  this.ielts = this.edu_documents.find(
        //   d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip3'
        // );



      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });

  }

  downloadImage(data: any) {

    this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }




  drawGauge(): void {
    const canvas = this.gaugeCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // container width responsive
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 400;
    const scale = Math.min(containerWidth / 400, 1);
    const canvasWidth = 350 * scale;
    const canvasHeight = 170 * scale;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height;
    const outerRadius = 160 * scale;
    const innerRadius = 145 * scale;
    const startAngle = Math.PI;
    const gapAngle = 0.015;
    const gapWidth = 8 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // inner gradient circle
    const gradient = ctx.createLinearGradient(centerX, centerY - innerRadius, centerX, centerY + innerRadius);
    gradient.addColorStop(0, '#84BD32');
    gradient.addColorStop(0.5, '#FFFFFF');

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw small indicator lines around the periphery of inner circle
    const lineCount = 40; // Number of lines
    const lineLength = 10; // Length of each line
    const lineWidth = 1;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = lineWidth;

    for (let i = 0; i <= lineCount; i++) {
      const angle = startAngle + (i / lineCount) * Math.PI;
      const x1 = centerX + Math.cos(angle) * (innerRadius - lineLength);
      const y1 = centerY + Math.sin(angle) * (innerRadius - lineLength);
      const x2 = centerX + Math.cos(angle) * innerRadius;
      const y2 = centerY + Math.sin(angle) * innerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }



    // outer color segments
    const segments = [
      { start: 0, end: 0.25, color: '#FF5656' }, // Poor
      { start: 0.25, end: 0.50, color: '#FEE114' }, // Average
      { start: 0.50, end: 0.75, color: '#D1D80F' }, // Good
      { start: 0.75, end: 1, color: '#30AD43' } // Excellent
    ];

    segments.forEach((segment, i) => {
      const segStart = startAngle + (segment.start * Math.PI) + (i > 0 ? gapAngle : 0);
      const segEnd = startAngle + (segment.end * Math.PI) - (i < segments.length - 1 ? gapAngle : 0);
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, segStart, segEnd);
      ctx.lineWidth = 20;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
    });

    // calculate and draw needle
    const minScore = 300;
    const maxScore = 900;
    const scoreRatio = Math.max(0, Math.min(1, (this.creditScore - minScore) / (maxScore - minScore)));
    const needleAngle = startAngle + (scoreRatio * Math.PI);

    // Draw needle (black indicator) - starting outside the center dot
    const centerDotRadius = 12;
    const needleGap = 3;
    const needleEndRadius = innerRadius - 15; // End before inner circle edge
    const needleBaseRadius = centerDotRadius + needleGap;;

    const baseWidth = 8;                     // THICK near center
    const tipWidth = 0.5;                    // NARROW at tip

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle);

    ctx.beginPath();
    ctx.moveTo(needleBaseRadius, -baseWidth);
    ctx.lineTo(needleEndRadius, tipWidth);
    ctx.lineTo(needleEndRadius, tipWidth);
    ctx.lineTo(needleBaseRadius, baseWidth);
    ctx.closePath();
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();

    // center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  }

  ngAfterViewInit() {
    this.drawGauge();
    this.drawGaugerisk();

    // Redraw on window resize
    window.addEventListener('resize', () => {
      this.drawGauge();
      this.drawGaugerisk();
    });
  }

  //loan details - risk analysis
  drawGaugerisk(): void {
    const canvas = this.gaugeCanvasrisk.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // container width responsive
    const container = canvas.parentElement;
    const containerWidth = container?.clientWidth || 400;
    const scale = Math.min(containerWidth / 400, 1);
    const canvasWidth = 350 * scale;
    const canvasHeight = 170 * scale;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height;
    const outerRadius = 160 * scale;
    const innerRadius = 145 * scale;
    const startAngle = Math.PI;
    const gapAngle = 0.0125;
    const gapWidth = 8 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // inner gradient circle
    const gradient = ctx.createLinearGradient(centerX, centerY - innerRadius, centerX, centerY + innerRadius);
    gradient.addColorStop(0, '#FDC162 ');
    gradient.addColorStop(0.6, '#FFFFFF');

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw small indicator lines around the periphery of inner circle
    const lineCount = 35; // Number of lines
    const lineLength = 12; // Length of each line
    const lineWidth = 1;

    ctx.strokeStyle = 'rgba(255, 255, 255)';
    ctx.lineWidth = lineWidth;

    for (let i = 0; i <= lineCount; i++) {
      const angle = startAngle + (i / lineCount) * Math.PI;
      const x1 = centerX + Math.cos(angle) * (innerRadius - lineLength);
      const y1 = centerY + Math.sin(angle) * (innerRadius - lineLength);
      const x2 = centerX + Math.cos(angle) * innerRadius;
      const y2 = centerY + Math.sin(angle) * innerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }



    // outer color segments
    const segments = [
      { start: 0, end: 0.30, color: '#3B8439' }, // low
      { start: 0.31, end: 0.60, color: '#FA0' }, // medium
      { start: 0.61, end: 1, color: '#E40010' }, // hight

    ];

    segments.forEach((segment, i) => {
      const segStart = startAngle + (segment.start * Math.PI) + (i > 0 ? gapAngle : 0);
      const segEnd = startAngle + (segment.end * Math.PI) - (i < segments.length - 1 ? gapAngle : 0);
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, segStart, segEnd);
      ctx.lineWidth = 15;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
    });

    // calculate and draw needle
    const minScore = 300;
    const maxScore = 900;
    const scoreRatio = Math.max(0, Math.min(1, (this.creditScore - minScore) / (maxScore - minScore)));
    const needleAngle = startAngle + (scoreRatio * Math.PI);

    // Draw needle (black indicator) - starting outside the center dot
    
    const centerDotRadius = 14;
    const needleGap = 3;
    const needleEndRadius = innerRadius - 15; // End before inner circle edge
    const needleBaseRadius = centerDotRadius + needleGap;;

    const baseWidth = 8;                     // THICK near center
    const tipWidth = 0.5;                    // NARROW at tip

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle);

    ctx.beginPath();
    ctx.moveTo(needleBaseRadius, -baseWidth);
    ctx.lineTo(needleEndRadius, tipWidth);
    ctx.lineTo(needleEndRadius, tipWidth);
    ctx.lineTo(needleBaseRadius, baseWidth);
    ctx.closePath();

    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();

    // center circle

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerDotRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#000';
    ctx.fill();
  }


  ngOnDestroy() {
    window.removeEventListener('resize', () => {
      this.drawGauge();
      this.drawGaugerisk();
    });
  }
  downloadReport(): void {
    console.log('Downloading latest report...');
    // Implement download logic here
  }

  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'verified':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'document issue':
        return 'Document-Issue';
      default:
        return '';
    }
  }
  // ************************los audit trail********************************

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
    // Sample data - replace with actual API call
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



  /****************  Quick links ****************/
  onQuickLinkTabChange(tabIndex: number) {
    this.selectedTabIndex = tabIndex;

    // Smooth scroll to top of content
    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // **********************checkbox*****************************

  onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
  }

  //******************radio buttons*************************** */


  isCheckedDefault = false;
  isCheckedChecked = true;

  onCheckboxChange1(value: boolean, label: string) {
    console.log(label, value);
    // Update local state if you want two-way binding
    if (label === 'Default') this.isCheckedDefault = value;
    if (label === 'Checked') this.isCheckedChecked = value;
  }


  checkselectedOption = 'option2';

  getIconColor(icon: string): string {
    const colorMap: { [key: string]: string } = {
      'trending-up': 'secondary',
      'square': 'danger',
      'warning': 'warning',
      'check': 'success'
    };
    return colorMap[icon] || 'secondary';
  }


}