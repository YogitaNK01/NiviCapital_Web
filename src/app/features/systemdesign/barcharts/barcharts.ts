import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';

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

  @HostListener('window:resize')
  
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
    if (!this.datasets || this.datasets.length === 0 || !this.labels) return;

    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;

    // // Find max value
    const allValues = this.datasets.flatMap(d => d.values);
    const step = 20; // step size for Y-axis
    const maxTick = Math.ceil(Math.max(...allValues) / step) * step; // round up to nearest 20
    this.maxValue = maxTick;

    // Generate ticks from 0 to maxTick
    this.yTicks = [];
    for (let val = 0; val <= maxTick; val += step) {
      this.yTicks.push(val);
    }



    this.bars = [];

    this.labels.forEach((label, idx) => {
      if (this.horizontal) {
        // Horizontal bars
        const barGap = 6;  // space between grouped bars
        const barGap1 = 0; // space between bars inside a group

        const groupHeight = chartHeight / this.labels.length;
        const availableHeight = groupHeight - barGap;
        const autoBarHeight = availableHeight / this.datasets.length;
        const finalBarHeight = this.barWidth ?? autoBarHeight;

        this.datasets.forEach((dataset, dIdx) => {
          // Base y position for the group
          let y = this.padding.top + idx * groupHeight + dIdx * (finalBarHeight + barGap1);
          y += barGap / 2; // center the group vertically

          // x position and width
          let x = this.padding.left;
          let width = (dataset.values[idx] / this.maxValue) * chartWidth;

          this.bars.push({
            x,
            y,
            width,
            height: finalBarHeight,
            color: dataset.color,
            orientation: 'horizontal'
          });
        });

      } else {
        // Vertical bars

        const barGap = 8; // space between grouped bars
        const barGap1 = 2; // space between each bars
        const groupWidth = chartWidth / this.labels.length;
        const availableWidth = groupWidth - barGap;
        const autoBarWidth = availableWidth / this.datasets.length;
        const finalBarWidth = this.barWidth ?? autoBarWidth;

        this.datasets.forEach((dataset, dIdx) => {
          const value = dataset.values[idx] || 0;
          const height = (value / this.maxValue) * chartHeight;

          // Calculate x and y positions
          let x = this.padding.left + idx * groupWidth + dIdx * (finalBarWidth + barGap1);
          x += barGap / 1; // center bars group
          let y = this.height - this.padding.bottom - height;

          // Push each bar
          this.bars.push({
            x,
            y,
            width: finalBarWidth,
            height,
            color: dataset.color,
            orientation: 'vertical'
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
