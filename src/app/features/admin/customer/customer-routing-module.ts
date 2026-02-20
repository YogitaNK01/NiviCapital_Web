import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddCustomer } from './add-customer/add-customer';
import { Otpsection } from './otpsection/otpsection';
import { Checkcontact } from './checkcontact/checkcontact';

const routes: Routes = [
   {
    path: '',
    redirectTo: 'addcustomer',
    pathMatch: 'full'
  },
   {
    path: 'checkcontact',
    component: Checkcontact
  },
  {
    path: 'addcustomer',
    component: AddCustomer
  },
  {
    path: 'otpsection',
    component: Otpsection
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
