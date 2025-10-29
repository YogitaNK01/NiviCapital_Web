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
  const containerWidth = container?.clientWidth || 400;
  
  // Calculate responsive sizes
  const scale = Math.min(containerWidth / 400, 1);
  const canvasWidth = 400 * scale;
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

  // Rest of your drawing code remains the same, but multiply all fixed values by 'scale'
  // ... (keep your existing drawing logic)
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
