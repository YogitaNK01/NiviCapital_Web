import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../core/service/main';

@Component({
  selector: 'app-education',
  imports: [],
  templateUrl: './education.html',
  styleUrl: './education.scss'
})
export class Education implements OnInit {
  tenthMarksheet: any;
  tenthLC: any;
  twelthMarksheet: any;
  twelfthLC: any;
  ugMarksheet: any;
  ugLC: any;
  pgMarksheet: any;
  pgLC: any;
  pgCert: any;
  scorecard: any;
  uniofferletter: any;
  salaryslip1: any;
  salaryslip2: any;
  salaryslip3: any;
  form16: any;
  itr1: any
  itr2: any;
  itr3: any;
  bankstatement: any;
  ielts: any

  loanDetails: any;

constructor( private service: Main) { }
  ngOnInit(): void {
   this.loanDetails = this.service.get_los_Data();
    console.log(" data---",this.loanDetails);
  }


  viewImage(imagePath: string): void {
    window.open(imagePath, '_blank');
  }
  downloadImage(data: any) {


  }

}
