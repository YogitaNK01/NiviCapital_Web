import { CommonModule } from '@angular/common';
import { Component, ElementRef, input, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Router } from '@angular/router';
import { Aesutil } from '../../../utils/aesutil';
import { Sanctionletter } from '../sanctionletter/sanctionletter';
import { Main } from '../../../core/service/main';
import { Quicklinks } from '../quicklinks/quicklinks';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';

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

export interface AuditTrail {
  date: Date;
  time: string;
  action: string;
  reference: string;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-customerdetails',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, Buttons, FormsModule, Inputfield, Dropdown, Sanctionletter],
  templateUrl: './customerdetails.html',
  styleUrl: './customerdetails.scss'
})
export class Customerdetails {

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

  searchQuery: string = '';
  selectedFilter: string = 'all';
  auditTrails: AuditTrail[] = [];
  filteredAuditTrails: AuditTrail[] = [];


  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;
   
  @Input() creditScore = 780;

  gaugeLabels = [
    { title: 'POOR', range: '300–550' },
    { title: 'AVERAGE', range: '550–650' },
    { title: 'GOOD', range: '650–750' },
    { title: 'EXCELLENT', range: '750–900' }
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
  constructor(public router: Router, private aes: Aesutil, private service: Main) { }

  async ngOnInit(): Promise<void> {
    console.log("loaded data")
    const saved = localStorage.getItem('selecteduserDetails');
    this.userData = saved ? JSON.parse(saved) : null;
    const kyc = sessionStorage.getItem('kycs');
    this.kycData = kyc ? JSON.parse(kyc) : null;
    console.log('kycData user data:', this.kycData);
    this.kyc_documents = this.kycData[0].documents;
    console.log('kycData.documents data:', this.kyc_documents);
    // this.encryptAadhar();
    // this.decryptAadhar()
    // this. getAllDocumnets();

    this.loadAuditTrails()

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

  async encryptAadhar() {
    const aadhaarNumber = 'abcde1234f'; // example input
    var result: any;
    try {
      result = await this.aes.encrypt(this.kycData[0].aadhaarNumber);
      console.log('✅ Encrypted Aadhaar:', result.ciphertext);
      console.log('🔑 IV (Base64):', result.iv);
    } catch (error) {
      console.error('Encryption failed:', error);
    }

    setTimeout(async () => {
      try {
        const decryptedAadhar = await this.aes.decrypt(result.ciphertext, result.iv);
        console.log('Decrypted Aadhaar:', decryptedAadhar);
      } catch (e) {
        console.error('Error decrypting Aadhaar:', e);
      }
    }, 5000);

  }

  async decryptAadhar() {
    const encryptedAadhar = 'FaRC2vqwGdG8Nx66B52ShPQch47vneHV0v4=';
    const ivBase64 = 'Hk9V3jvL7p7F+uPL'; // whatever IV came with it


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
    const needleStartRadius = 18; // Start outside the center dot (dot radius is 10)
    const needleEndRadius = innerRadius - 15; // End before inner circle edge

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle);

    // Draw needle as a tapered shape
    ctx.beginPath();
    ctx.moveTo(needleStartRadius, -3);
    ctx.lineTo(needleEndRadius, -2);
    ctx.lineTo(needleEndRadius, 2);
    ctx.lineTo(needleStartRadius, 3);
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

    // Redraw on window resize
    window.addEventListener('resize', () => {
      this.drawGauge();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => {
      this.drawGauge();
    });
  }
  downloadReport(): void {
    console.log('Downloading latest report...');
    // Implement download logic here
  }

  viewDetails(history: CibilHistory): void {
    console.log('Viewing details for:', history);
    // Implement view details logic here
  }
  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }





  /****************   customer detail tabs ****************/

  // Download CIF
  downloadCIF(): void {
    // Implement download logic
    console.log('Downloading CIF for:');
  }

  // Edit customer
  editCustomer(): void {
    // Implement edit logic
    console.log('Editing customer:');
  }



  /******************************* Audit Trails************************/

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

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    return `status-${statusLower}`;
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
}
