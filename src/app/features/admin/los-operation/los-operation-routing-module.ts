import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Newloan } from './newloan/newloan';
import { Selectproduct } from './selectproduct/selectproduct';

const routes: Routes = [

  {
      path: '',
      redirectTo: 'newloan',
      pathMatch: 'full'
    },
     {
      path: 'newloan',
      component: Newloan
    },
    {
      path: 'selectproduct',
      component: Selectproduct
    },
    
    

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LosOperationRoutingModule { }
