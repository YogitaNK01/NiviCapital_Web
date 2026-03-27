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
import { Assetsinfo } from './assetsinfo/assetsinfo';
import { Liabilitiesinfo } from './liabilitiesinfo/liabilitiesinfo';
import { Monthlyexpenditureinfo } from './monthlyexpenditureinfo/monthlyexpenditureinfo';
import { Referenceinfo } from './referenceinfo/referenceinfo';
import { Coapplicantinfo } from './coapplicantinfo/coapplicantinfo';
import { Summaryinfo } from './summaryinfo/summaryinfo';

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
      { path: 'assetsinfo', component: Assetsinfo },
      { path: 'liabilitiesinfo', component: Liabilitiesinfo },
      { path: 'monthlyexpinfo', component: Monthlyexpenditureinfo },
      { path: 'referenceinfo', component: Referenceinfo },
      // { path: 'coapplicantinfo', component: Coapplicantinfo },
      { path: 'summaryinfo', component: Summaryinfo },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanformRoutingModule { }
