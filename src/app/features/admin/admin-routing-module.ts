import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';
import { Customerdetails } from './customer/customerdetails/customerdetails';

const routes: Routes = [
  {
      path: '',
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
         { path: 'customer/customerdetails', component: Customerdetails},
      ]
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
