import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Buttons } from '../../../../systemdesign/buttons/buttons';

interface CreditStats {
  totalCredit: string;
  totalAccounts: number;
  numberOfLoans: number;
  outstandingAmount: string;
}

interface CibilHistory {
  dateGenerated: string;
  name: string;
  generatedBy: string;
  creditScore: number;
}

@Component({
  selector: 'app-creditscore',
  imports: [CommonModule,Buttons],
  templateUrl: './creditscore.html',
  styleUrl: './creditscore.scss'
})
export class Creditscore {

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

  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;

  creditScore:any;
 reportDate: string = '20-06-2025';
  source: string = 'TransUnion CIBIL';


   ngAfterViewInit() {
    this.drawGauge();
    

    // Redraw on window resize
    window.addEventListener('resize', () => {
      this.drawGauge();
      
    });
  }
    downloadReport(): void {
    console.log('Downloading latest report...');
    
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
}
