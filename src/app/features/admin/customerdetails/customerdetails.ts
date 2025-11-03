import { CommonModule} from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Router } from '@angular/router';

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
  selector: 'app-customerdetails',
  standalone: true,

  imports: [CommonModule, MatTabsModule, MatIconModule, Buttons],
  templateUrl: './customerdetails.html',
  styleUrl: './customerdetails.scss'
})
export class Customerdetails {
  selectedTabIndex = 0;
  userData: any;
  issalaried: Boolean = false;

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

  address: Address = {
    addressLine1: '123, Main Street, Anytown',
    addressLine2: 'Lorem ipsum dummy text',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    zipcode: '400001'
  };

  cibilHistory: CibilHistory[] = [
    { dateGenerated: '25/07/2025', name: 'Vighnesh', generatedBy: 'Sandeep', creditScore: 780 },
    { dateGenerated: '22/11/2024', name: 'Vighnesh', generatedBy: 'Aarti', creditScore: 820 },
    { dateGenerated: '04/05/2024', name: 'Vighnesh', generatedBy: 'Priya', creditScore: 690 }
  ];
  constructor(public router:Router){}

  ngOnInit(): void {
   console.log("loaded data")
    const saved = localStorage.getItem('selecteduserDetails');
    this.userData = saved ? JSON.parse(saved) : null;
    console.log('Received user data:', this.userData);
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

  downloadImage(imagePath: string): void {
    // ✅ Triggers file download
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = imagePath.split('/').pop() || 'downloaded-image.png';
    link.click();
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

}
