import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';
import { Customerdetails } from './customerdetails/customerdetails';
import { Sanctionletter } from './sanctionletter/sanctionletter';
import { LosOperation } from './los-operation/los-operation';
import { LosDetails } from './los-details/los-details';
import { Commontabs } from '../systemdesign/commontabs/commontabs';
import { CoApplicantDetails } from './co-applicantdetails/co-applicant';
import { AddCustomer } from './customer/add-customer/add-customer';
import { LoanformModule } from '../admin/loanform/loanform-module';

const routes: Routes = [
  
      
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
        { path: 'customerdetails', component: Customerdetails},
        { path: 'sanctionletter', component: Sanctionletter},
        { path: 'losoperation', component: LosOperation},
        { path: 'losdetails', component: LosDetails},
         { path: 'commontabs', component: Commontabs},
         { path: 'coapplicantdetails', component: CoApplicantDetails},
       

  {
  path: 'customer',
  loadChildren: () => import('../admin/customer/customer-module').then(m => m.CustomerModule)
},
{
  path: 'losoperation',
  loadChildren: () => import('../admin/los-operation/los-operation-module').then(m => m.LosOperationModule)
},


        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
