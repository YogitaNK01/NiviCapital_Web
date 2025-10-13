import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';


interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-charts',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './charts.html',
  styleUrl: './charts.scss'
})
export class Charts implements OnInit,OnChanges {
 @Input() title: string = 'Donut Chart';
  @Input() data: ChartData[] = [];
  @Input() showValue: boolean = false;
  @Input() centerValue: string = '';
  @Input() width: number = 300;
  @Input() height: number = 300;
 @Input() radius: number = 80;
  @Input() innerRadius: number = 50;
  @Input() centerX: number = 100;
  @Input() centerY: number = 100;

  totalValue: number = 0;
  segments: any[] = [];

  ngOnInit() {
    this.calculateChart();
  }

  ngOnChanges() {
    this.calculateChart();
  }

 calculateChart() {
    this.totalValue = this.data.reduce((sum, item) => sum + item.value, 0);
    
    let currentAngle = -90; // Start from top
    this.segments = this.data.map(item => {
      const percentage = (item.value / this.totalValue) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...item,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        path: this.createArcPath(currentAngle, currentAngle + angle)
      };
      currentAngle += angle;
      return segment;
    });
  }

  createArcPath(startAngle: number, endAngle: number): string {
    const radius = this.radius;
    const innerRadius = this.innerRadius;
    const centerX = this.centerX;
    const centerY = this.centerY;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  }

  formatValue(value: number): string {
    return value.toLocaleString();
  }


  
}
