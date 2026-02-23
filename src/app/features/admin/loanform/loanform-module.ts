import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoanformRoutingModule } from './loanform-routing-module';
import { Loanlayout } from './loanlayout/loanlayout';
import { LoanInfo } from './loan-info/loan-info';
import { GeneralInfo } from './general-info/general-info';
import { Loanstepper } from './loanstepper/loanstepper';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoanformRoutingModule,
    Loanlayout,
    Loanstepper,
    LoanInfo,
    GeneralInfo
  ]
})
export class LoanformModule { }
