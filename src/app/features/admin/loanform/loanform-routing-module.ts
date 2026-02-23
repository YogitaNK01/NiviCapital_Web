import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanInfo } from './loan-info/loan-info';
import { GeneralInfo } from './general-info/general-info';
import { Loanlayout } from './loanlayout/loanlayout';

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
      {path: 'genralinfo', component: GeneralInfo},
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanformRoutingModule { }
