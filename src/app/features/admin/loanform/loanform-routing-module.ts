import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanInfo } from './loan-info/loan-info';
import { GeneralInfo } from './general-info/general-info';
import { Loanlayout } from './loanlayout/loanlayout';
import { EstExpense } from '../tabs/est-expense/est-expense';
import { Additionalinfo } from './additionalinfo/additionalinfo';
import { Estimateexpense } from './estimateexpense/estimateexpense';
import { Kycinfo } from './kycinfo/kycinfo';
import { Educationinfo } from './educationinfo/educationinfo';
import { Incomeinfo } from './incomeinfo/incomeinfo';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'loanform',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: Loanlayout,
    children: [
      { path: '', redirectTo: 'loaninfo', pathMatch: 'full' },
      { path: 'loaninfo', component: LoanInfo },
      { path: 'genralinfo', component: GeneralInfo },
      { path: 'expense', component: Estimateexpense },
      { path: 'additionalinfo', component: Additionalinfo },
      { path: 'kycinfo', component: Kycinfo },
      { path: 'educationinfo', component: Educationinfo },
      { path: 'incomeinfo', component: Incomeinfo },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanformRoutingModule { }
