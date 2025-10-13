import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';

const routes: Routes = [
  {
      path: '',
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
      ]
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
