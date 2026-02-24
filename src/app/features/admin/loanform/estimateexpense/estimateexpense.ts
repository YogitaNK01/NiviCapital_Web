import { Component } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-estimateexpense',
  imports: [Buttons,CommonModule,RouterModule],
  templateUrl: './estimateexpense.html',
  styleUrl: './estimateexpense.scss'
})
export class Estimateexpense {

  constructor(private stepperService:Loanstepperservice){}


   back(){
    this.stepperService.previous();
  }
  
   next() {
  this.stepperService.next();
}
}
