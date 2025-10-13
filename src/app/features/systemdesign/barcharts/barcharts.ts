import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface BarDataset {
  values: number[];
  color: string;
}

@Component({
  selector: 'app-barcharts',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './barcharts.html',
  styleUrl: './barcharts.scss'
})
export class Barcharts {
  //  @Input() title: string = '';
  @Input() labels: string[] = [];
  @Input() datasets: any[] = []

@Input() title: string = 'Chart';
//   @Input() datasets: BarDataset[] = [];
  @Input() width: number = 500;
  @Input() height: number = 280;

  @Input() horizontal: boolean = false; // true for horizontal bars
@Input() singleBarMultiDataset: boolean = false; // true: multiple values stacked in a single bar
@Input() barWidth: number | null = null; // null means auto width


  padding = { top: 20, right: 20, bottom: 40, left: 50 };
  bars: any[] = [];
  yTicks: number[] = [];
  maxValue: number = 100;

  ngOnInit() { this.render(); }
  ngOnChanges() { this.render(); }

  render1() {
    const allValues = this.datasets.flatMap(d => d.values);
    this.maxValue = Math.ceil(Math.max(...allValues) / 20) * 20;
    this.yTicks = Array.from({ length: 6 }, (_, i) => (i * this.maxValue) / 5);
    
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    const groupWidth = chartWidth / this.labels.length;
    const barWidth = groupWidth / (this.datasets.length + 1);

    this.bars = [];
    this.labels.forEach((_, groupIdx) => {
      this.datasets.forEach((dataset, datasetIdx) => {
        const value = dataset.values[groupIdx] || 0;
        const barHeight = (value / this.maxValue) * chartHeight;
        const x = this.padding.left + groupIdx * groupWidth + datasetIdx * barWidth + barWidth * 0.3;
        const y = this.height - this.padding.bottom - barHeight;

        this.bars.push({
          x, y,
          width: barWidth * 0.8,
          height: barHeight,
          color: dataset.color
        });
      });
    });
  }

 render() {
  if (!this.datasets || this.datasets.length === 0 || !this.labels) return;

  const chartWidth = this.width - this.padding.left - this.padding.right;
  const chartHeight = this.height - this.padding.top - this.padding.bottom;

  // Find max value
  const allValues = this.datasets.flatMap(d => d.values);
  this.maxValue = Math.ceil(Math.max(...allValues) / 20) * 20;
  this.yTicks = Array.from({ length: 6 }, (_, i) => (i * this.maxValue) / 5);

  this.bars = [];

  this.labels.forEach((label, idx) => {
    if (this.horizontal) {
      const groupHeight = chartHeight / this.labels.length;
      const autoBarHeight = groupHeight / (this.datasets.length + (this.singleBarMultiDataset ? 0 : 1));
      const finalBarHeight = this.barWidth ?? autoBarHeight;

      this.datasets.forEach((dataset, dIdx) => {
        let y = this.padding.top + idx * groupHeight;
        let x = this.padding.left;
        let width = (dataset.values[idx] / this.maxValue) * chartWidth;
        let height = this.singleBarMultiDataset ? finalBarHeight : finalBarHeight;
        if (!this.singleBarMultiDataset) y += dIdx * finalBarHeight;

        this.bars.push({ x, y, width, height, color: dataset.color });
      });
    } else {
      // Vertical bars
      const groupWidth = chartWidth / this.labels.length;
      const autoBarWidth = groupWidth / (this.datasets.length + (this.singleBarMultiDataset ? 0 : 1));
      const finalBarWidth = this.barWidth ?? autoBarWidth;

      this.datasets.forEach((dataset, dIdx) => {
        const value = dataset.values[idx] || 0;
        const height = (value / this.maxValue) * chartHeight;
        let x = this.padding.left + idx * groupWidth;
        let y = this.height - this.padding.bottom - height;

        if (!this.singleBarMultiDataset) x += dIdx * finalBarWidth;

        this.bars.push({
          x,
          y,
          width: this.singleBarMultiDataset ? finalBarWidth : finalBarWidth,
          height,
          color: dataset.color
        });
      });
    }
  });
}



  getYAxisTicks(): number[] {
  return this.yTicks;
}

  getYPosition(value: number): number {
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    return this.height - this.padding.bottom - (value / this.maxValue) * chartHeight;
  }

  getXCenter(index: number): number {
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const groupWidth = chartWidth / this.labels.length;
    return this.padding.left + index * groupWidth + groupWidth / 2;
  }
}
