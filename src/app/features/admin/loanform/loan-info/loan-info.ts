import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Router } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-loan-info',
  imports: [CommonModule,Buttons],
  standalone:true,
  templateUrl: './loan-info.html',
  styleUrl: './loan-info.scss'
})
export class LoanInfo implements OnInit {

  constructor(private router: Router,private stepperService:Loanstepperservice) { }
  ngOnInit(): void {
   
  }
  back(){
    
  }

  next() {
  this.stepperService.next();
}
}
