import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-loanstepper',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './loanstepper.html',
  styleUrl: './loanstepper.scss'
})
export class Loanstepper implements OnInit {
  steps: any;

  constructor(public router: Router, public stepservice: Loanstepperservice) {

  }

  ngOnInit() {
    this.steps = this.stepservice.steps;
  }

  get currentIndex(): number {
    const currentRoute = this.router.url.split('/').pop();
    return this.steps.findIndex((s: { route: string | undefined; }) => s.route === currentRoute);
  }
  isActive(route: string) {
    return this.router.url.includes(route);
  }

  goToStep(route: string) {
    this.router.navigate(['/loanform', route]);
  }

  isCompleted(index: number): boolean {
    return index < this.currentIndex;
  }

  isUpcoming(index: number): boolean {
    return index > this.currentIndex;
  }


}
