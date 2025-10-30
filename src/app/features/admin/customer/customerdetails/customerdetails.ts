import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../../systemdesign/buttons/buttons';

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

  issalaried: Boolean = false;

  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;

  creditScore: number = 780;
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

  ngOnInit(): void {
    // Component initialization
    this.drawGauge();
  }


drawGauge(): void {
  const canvas = this.gaugeCanvas.nativeElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Get container size for responsiveness
  const container = canvas.parentElement;
  const containerWidth = container?.clientWidth || 500;
  
  // Calculate responsive sizes
  const scale = Math.min(containerWidth / 400, 1);
  const canvasWidth = 350 * scale;
  const canvasHeight = 200 * scale;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const centerX = canvas.width / 2;
  const centerY = canvas.height;
  const outerRadius = 160 * scale;
  const innerRadius = 145 * scale;
  const startAngle = Math.PI;
  const gapAngle = 0.015;
  const gapWidth = 8 * scale;

  // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw inner circle with linear gradient background (green to white)
    const gradient = ctx.createLinearGradient(centerX, centerY - innerRadius, centerX, centerY + innerRadius);
    gradient.addColorStop(0, '#84BD32'); // Green at top
    gradient.addColorStop(0.4896, '#FFFFFF'); // White at ~49%

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

    // Draw white gap (ring) between inner and outer circles
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius + gapWidth, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Clear the inner part to show the gradient circle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Redraw inner circle (since we used destination-out)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Redraw indicator lines after composite operation
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

    // Draw gauge segments with gaps
    const segments = [
      { start: 0, end: 0.25, color: '#ef4444' }, // Red - Poor
      { start: 0.25, end: 0.417, color: '#fbbf24' }, // Yellow/Orange - Average
      { start: 0.417, end: 0.75, color: '#a3e635' }, // Light Green - Good
      { start: 0.75, end: 1, color: '#22c55e' } // Dark Green - Excellent
    ];

    segments.forEach((segment, index) => {
      const segmentStartAngle = startAngle + (segment.start * Math.PI) + (index > 0 ? gapAngle : 0);
      const segmentEndAngle = startAngle + (segment.end * Math.PI) - (index < segments.length - 1 ? gapAngle : 0);

      // Draw outer arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, segmentStartAngle, segmentEndAngle);
      ctx.lineWidth = 20;
      ctx.strokeStyle = segment.color;
      ctx.lineCap = 'butt';
      ctx.stroke();
    });

    // Calculate needle angle based on score
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

    // Draw center circle (black) - drawn after needle so it's on top
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#000000';
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
