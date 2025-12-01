import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';

export interface AreaDataset {
  data: number[];
  fillColor: string;
  strokeColor: string;
  label?: string;
}

export type ChartType = 'area' | 'line' | 'overlay';

@Component({
  selector: 'app-areacharts',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './areacharts.html',
  styleUrl: './areacharts.scss'
})
export class Areacharts implements OnInit, OnChanges {
 @Input() title: string = 'Chart';
  @Input() labels: string[] = [];
  @Input() datasets: AreaDataset[] = [];
  @Input() type: ChartType = 'area'; // 'area', 'line', or 'overlay'
  @Input() width: number = 500;
  @Input() height: number = 280;
  @Input() showFill: boolean = true;
  @Input() fillOpacity: number = 0.6;
  @Input() strokeWidth: number = 2.5;
  @Input() showGrid: boolean = true;
  @Input() showXAxis: boolean = true;
  @Input() showYAxis: boolean = true;
  @Input() tension: number = 0.4; // Curve tension (0-1)

  padding = { top: 20, right: 20, bottom: 40, left: 50 };
  areas: any[] = [];
  yTicks: number[] = [];
  maxValue: number = 100;
  minValue: number = 0;

  ngOnInit() { this.render(); }
  ngOnChanges() { this.render(); }

  
 onResize() {
    // this.updateChartSize();
  }

  updateChartSize() {
    const screenWidth = window.innerWidth;

    if (screenWidth <= 480) {
      this.width = 250;
      this.height = 200;
    } else if (screenWidth <= 768) {
      this.width = 400;
      this.height = 300;
    } else {
      this.width = 500;
      this.height = 350;
    }
  }
  render() {
    const allValues = this.datasets.flatMap(d => d.data);
    this.maxValue = Math.ceil(Math.max(...allValues) / 20) * 20;
    this.minValue = Math.floor(Math.min(...allValues, 0) / 20) * 20;
    
    const range = this.maxValue - this.minValue;
    this.yTicks = Array.from({ length: 6 }, (_, i) => 
      this.minValue + (i * range) / 5
    );

    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    const stepX = chartWidth / (this.labels.length - 1);

    this.areas = this.datasets.map(dataset => {
      const points = dataset.data.map((value, i) => ({
        x: this.padding.left + i * stepX,
        y: this.getYPos(value)
      }));

      // // Create smooth curve
      // let strokePath = this.createSmoothPath(points);

      // // Fill path
      // let fillPath = '';
      // if (this.shouldShowFill()) {
      //   const baseline = this.getYPos(this.minValue);
      //   fillPath = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`;
      //   for (let i = 1; i < points.length; i++) {
      //     const prev = points[i - 1];
      //     const curr = points[i];
      //     const cpX = (prev.x + curr.x) / 2;
      //     fillPath += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
      //   }
      //   fillPath += ` L ${points[points.length - 1].x} ${baseline} Z`;
      // }

       // Create smooth curve using cubic Bezier
      let strokePath = this.createSmoothCubicPath(points);

      // Fill path with smooth curves
      let fillPath = '';
      if (this.shouldShowFill()) {
        const baseline = this.getYPos(this.minValue);
        fillPath = this.createSmoothCubicPath(points, baseline);
      }

      return {
        fillPath,
        strokePath,
        fillColor: dataset.fillColor,
        strokeColor: dataset.strokeColor,
        label: dataset.label || ''
      };
    });
  }

  createSmoothCubicPath(points: {x: number, y: number}[], baseline?: number): string {
    if (points.length === 0) return '';
    if (points.length === 1) {
      const p = points[0];
      if (baseline !== undefined) {
        return `M ${p.x} ${baseline} L ${p.x} ${p.y} L ${p.x} ${baseline} Z`;
      }
      return `M ${p.x} ${p.y}`;
    }

    // Calculate control points for smooth cubic Bezier curves
    const controlPoints = this.calculateControlPoints(points);

    let path = `M ${points[0].x} ${points[0].y}`;

    // Create cubic Bezier curve segments
    for (let i = 0; i < points.length - 1; i++) {
      const cp1 = controlPoints[i * 2];
      const cp2 = controlPoints[i * 2 + 1];
      const end = points[i + 1];
      path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    }

    // If baseline is provided, close the path for fill
    if (baseline !== undefined) {
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${baseline} L ${points[0].x} ${baseline} Z`;
    }

    return path;
  }

  calculateControlPoints(points: {x: number, y: number}[]): {x: number, y: number}[] {
    const controlPoints: {x: number, y: number}[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      // Calculate control point 1 (after p1)
      const cp1x = p1.x + (p2.x - p0.x) * this.tension;
      const cp1y = p1.y + (p2.y - p0.y) * this.tension;

      // Calculate control point 2 (before p2)
      const cp2x = p2.x - (p3.x - p1.x) * this.tension;
      const cp2y = p2.y - (p3.y - p1.y) * this.tension;

      controlPoints.push({ x: cp1x, y: cp1y });
      controlPoints.push({ x: cp2x, y: cp2y });
    }

    return controlPoints;
  }

  createSmoothPath(points: {x: number, y: number}[]): string {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  }

  shouldShowFill(): boolean {
    return this.showFill && this.type !== 'line';
  }

  getYPos(value: number): number {
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    const range = this.maxValue - this.minValue;
    return this.height - this.padding.bottom - 
           ((value - this.minValue) / range) * chartHeight;
  }

  getXPos(index: number): number {
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const stepX = chartWidth / (this.labels.length - 1);
    return this.padding.left + index * stepX;
  }

  formatTickValue(value: number): string {
    return Math.round(value).toString();
  }

}
