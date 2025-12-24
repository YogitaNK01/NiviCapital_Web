import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Quicklinks } from '../quicklinks/quicklinks';
import { Sanctionletter } from '../sanctionletter/sanctionletter';
import { ActivatedRoute, Router } from '@angular/router';
import { Main } from '../../../core/service/main';
import { Aesutil } from '../../../utils/aesutil';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { AuditTrail } from '../customerdetails/customerdetails';
import { Checkbox } from '../../systemdesign/checkbox/checkbox';
import { Radiobuttons } from '../../systemdesign/radiobuttons/radiobuttons';
import { ALL_TABS, AppTab, Commontabs } from '../../systemdesign/commontabs/commontabs';
import { Loandetails } from './tabs/loandetails/loandetails';
import { Education } from './tabs/education/education';
import { Occupation } from './tabs/occupation/occupation';
import { Assets } from './tabs/assets/assets';
import { Monthlyexp } from './tabs/monthlyexp/monthlyexp';
import { EstExpense } from './tabs/est-expense/est-expense';
import { Losproduct } from './tabs/losproduct/losproduct';
import { Creditscore } from './tabs/creditscore/creditscore';
import { Coapplicant } from './tabs/coapplicant/coapplicant';
import { Summary } from './tabs/summary/summary';
import { Audittrail } from './tabs/audittrail/audittrail';


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
  imports: [CommonModule, MatTabsModule, MatIconModule,  Quicklinks,Commontabs,
    Loandetails,Education,Occupation,Assets,Monthlyexp,EstExpense,Losproduct,Creditscore,Coapplicant,Summary,Audittrail
  ],
  standalone: true,
  templateUrl: './los-details.html',
  styleUrl: './los-details.scss'
})
export class LosDetails implements OnInit {

  selectedTabIndex = 0;
  tabIndexMap: { [key: string]: number } = {
    loan: 0,
    education: 1,
    occupation: 2,
    assets: 3,
    expenditure: 4,
    estimate: 5,
    products: 6,
    credit: 7,
    coapplicant: 8,
    summary: 9,
    audit: 10
  };

  tabs = ALL_TABS.filter(tab =>
    ['loan', 'education', 'occupation', 'assets','expenditure', 'estimate', 'los-products', 'credit','coapplicant', 'summary', 'audit'].includes(tab.id)
  );
  
  activeTabId = 'loan';
  

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

 



  constructor(public router: Router,public route: ActivatedRoute, private aes: Aesutil, private service: Main) { }

  async ngOnInit(): Promise<void> {

    this.route.queryParams.subscribe(params => {
      const tabKey = params['tab'];
      if (tabKey && this.tabIndexMap[tabKey] !== undefined) {
        this.selectedTabIndex = this.tabIndexMap[tabKey];
      }
    });
  //  this.loadAuditTrails();

    console.log("loaded data")
    const saved = localStorage.getItem('selecteduserDetails');
    this.userData = saved ? JSON.parse(saved) : null;
    this.getAllDocumnets();
   


  }
//individual tabs change
  onTabChange(tab: AppTab) {
    this.activeTabId = tab.id;
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

  getStatusClass1(status: string): string {
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