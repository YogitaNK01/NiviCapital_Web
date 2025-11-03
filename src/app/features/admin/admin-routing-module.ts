import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';
import { Customerdetails } from './customerdetails/customerdetails';

const routes: Routes = [
  
      
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
        { path: 'customerdetails', component: Customerdetails},
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
