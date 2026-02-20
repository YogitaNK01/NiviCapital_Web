import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, OnDestroy, Type, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Quicklinks } from '../quicklinks/quicklinks';
import { Sanctionletter } from '../sanctionletter/sanctionletter';
import { ActivatedRoute, Router } from '@angular/router';
import { Main } from '../../../core/service/main';
import { Aesutil } from '../../../utils/aesutil';
import { AuditTrail } from '../customerdetails/customerdetails';
import { AppTab, Commontabs } from '../../systemdesign/commontabs/commontabs';
import { TAB_CONFIG } from '../../../shared/config/tab.config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


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
  imports: [CommonModule, MatTabsModule, MatIconModule, Quicklinks, Commontabs, Buttons],
  standalone: true,
  templateUrl: './los-details.html',
  styleUrl: './los-details.scss'
})
export class LosDetails implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  
  selectedTabIndex = 0;
  tabs: AppTab[] = [];
  activeTabComponent!: Type<any>;
  private onWindowResize = () => {
    this.drawGauge();
    this.drawGaugerisk();
  };



  userData: any;
  kycData: any;
  issalaried: Boolean = false;

  kyc_documents: any[] = [];
  edu_documents: any[] = [];
  allApplicants: any[] = [];
  selecteduser: any;
  selectedDoc: any = null;



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





  constructor(public router: Router, public route: ActivatedRoute, private aes: Aesutil, private service: Main) { }

  async ngOnInit(): Promise<void> {
    const page = 'losdetails';
    const pageTabs = TAB_CONFIG.filter(t => t.page.includes(page));

    this.tabs = pageTabs.map(t => ({
      id: t.id,
      label: t.label
    }));

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const key = params['tab'];
      const active = pageTabs.find(t => t.routeKey === key) || pageTabs[0];
      this.selectedTabIndex = pageTabs.findIndex(t => t.routeKey === active.routeKey);
      console.log("Selected Tab Index:", this.selectedTabIndex);
      this.activeTabComponent = active.component;
    });
  }
  //individual tabs change
  onTabChange(tab: AppTab) {
     const config = TAB_CONFIG.find(t => t.id === tab.id)!;

  this.activeTabComponent = config.component;

  this.router.navigate([], {
    queryParams: { tab: config.routeKey },
    queryParamsHandling: 'merge'
  });
  }

  //credit score gauge
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
    window.addEventListener('resize', this.onWindowResize);
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


  downloadReport(): void {
    console.log('Downloading latest report...');
    // Implement download logic here
  }



  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    this.destroy$.next();
    this.destroy$.complete();
  }


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