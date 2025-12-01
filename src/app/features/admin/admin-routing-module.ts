import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';
import { Customerdetails } from './customerdetails/customerdetails';
import { Sanctionletter } from './sanctionletter/sanctionletter';
import { LosOperation } from './los-operation/los-operation';
import { LosDetails } from './los-details/los-details';

const routes: Routes = [
  
      
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
        { path: 'customerdetails', component: Customerdetails},
        { path: 'sanctionletter', component: Sanctionletter},
        { path: 'losoperation', component: LosOperation},
        { path: 'losdetails', component: LosDetails},
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
