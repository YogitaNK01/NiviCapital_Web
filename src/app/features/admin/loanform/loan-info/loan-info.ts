import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { ActivatedRoute, Router } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-loan-info',
  imports: [CommonModule,Buttons],
  standalone:true,
  templateUrl: './loan-info.html',
  styleUrl: './loan-info.scss'
})
export class LoanInfo implements OnInit {

  
  applicantId: string = '';
  applicationId: string = '';

  constructor(private router: Router,private stepperService:Loanstepperservice,private route: ActivatedRoute) { }
  ngOnInit(): void {
   this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];

        this.stepperService.setLoanId(this.applicantId ,this.applicationId);
      }
    });
  }
  back(){
    
  }

  next() {
  this.stepperService.next();
}
}
