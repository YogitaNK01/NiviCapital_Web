import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-coappstepper',
  imports: [CommonModule, RouterOutlet],
  standalone:true,
  templateUrl: './coappstepper.html',
  styleUrl: './coappstepper.scss'
})
export class Coappstepper {

  
  steps = [
    { label: 'Basic Info', route: 'co-basicinfo' },
    { label: 'General Info', route: 'co-general' },
    { label: 'Additional Info', route: 'co-additional' },
    // { label: 'KYC', route: 'co-kyc' },
    { label: 'Income Details', route: 'co-income' },
    { label: 'Assets', route: 'co-assets' },
    { label: 'Liabilities', route: 'co-liabilities' },
    { label: 'Monthly Expenditure', route: 'co-monthly-exp' },
    { label: 'Summary', route: 'co-summary' }
  ];
  currentIndex = 0;
  constructor(private router: Router,private route: ActivatedRoute) {

    
this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const childPath = this.route.firstChild?.snapshot.url?.[0]?.path;
      const idx = this.steps.findIndex(s => s.route === childPath);
      this.currentIndex = idx >= 0 ? idx : 0;
    });

  }

  // get currentIndex(): number {
  //   const route = this.router.url.split('/').pop();
  //   return this.steps.findIndex(s => s.route === route);
  // }

  goToStep(step: any, index: number) {
    this.router.navigate([ step.route],{ relativeTo: this.route });
  }

  isActive(index: number) {
    return index === this.currentIndex;
  }

  isCompleted(index: number) {
    return index < this.currentIndex;
  }
canNavigate(i: number) {
  return i <= this.currentIndex;
}

  
}
