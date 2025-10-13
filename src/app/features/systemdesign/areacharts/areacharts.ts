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

  padding = { top: 20, right: 20, bottom: 40, left: 50 };
  areas: any[] = [];
  yTicks: number[] = [];
  maxValue: number = 100;
  minValue: number = 0;

  ngOnInit() { this.render(); }
  ngOnChanges() { this.render(); }

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

      // Create smooth curve
      let strokePath = this.createSmoothPath(points);

      // Fill path
      let fillPath = '';
      if (this.shouldShowFill()) {
        const baseline = this.getYPos(this.minValue);
        fillPath = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const cpX = (prev.x + curr.x) / 2;
          fillPath += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
        }
        fillPath += ` L ${points[points.length - 1].x} ${baseline} Z`;
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
