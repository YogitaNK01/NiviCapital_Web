import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Customer } from './customer/customer';
import { Customerdetails } from './customerdetails/customerdetails';
import { Sanctionletter } from './sanctionletter/sanctionletter';
import { LosOperation } from './los-operation/los-operation';
import { LosDetails } from './los-details/los-details';
import { Table } from './table/table';
import { Commontabs } from '../systemdesign/commontabs/commontabs';
import { PiData } from '../admin/tabs/pi-data/pi-data';
import { PiiData } from '../admin/tabs/pii-data/pii-data';
import { KycData } from '../admin/tabs/kyc-data/kyc-data';
import { ProductData } from '../admin/tabs/product-data/product-data';

const routes: Routes = [
  
      
        { path: 'dashboard', component: Dashboard },
        { path: 'customer', component: Customer},
        { path: 'customerdetails', component: Customerdetails},
        { path: 'sanctionletter', component: Sanctionletter},
        { path: 'losoperation', component: LosOperation},
        { path: 'losdetails', component: LosDetails},
        { path: 'sharedtable', component: Table},
         { path: 'commontabs', component: Commontabs},

         //tabs
         { path: 'pi', component: PiData},
          { path: 'pii', component: PiiData},
           { path: 'kyc', component: KycData},
            { path: 'product', component: ProductData},

        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
