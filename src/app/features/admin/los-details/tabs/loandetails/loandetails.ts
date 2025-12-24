import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-loandetails',
  imports: [CommonModule],
  templateUrl: './loandetails.html',
  styleUrl: './loandetails.scss'
})
export class Loandetails {

  @Input() creditScore = 780;
    @ViewChild('gaugeCanvasrisk', { static: false }) gaugeCanvasrisk!: ElementRef<HTMLCanvasElement>;

  
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


   getIconColor(icon: string): string {
    const colorMap: { [key: string]: string } = {
      'trending-up': 'secondary',
      'square': 'danger',
      'warning': 'warning',
      'check': 'success'
    };
    return colorMap[icon] || 'secondary';
  }

   getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    return `status-${statusLower}`;
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
  
  ngAfterViewInit() {
    this.drawGaugerisk();

    // Redraw on window resize
    window.addEventListener('resize', () => {
      this.drawGaugerisk();
    });
  }

    ngOnDestroy() {
    window.removeEventListener('resize', () => {
     
      this.drawGaugerisk();
    });
  }
}


