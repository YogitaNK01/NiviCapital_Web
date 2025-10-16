import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';

export const routes: Routes = [

  
    {
  path: '',
  component: Layout,
  children: [
    {
      path: 'systemdesign',
      loadChildren: () => import('./features/systemdesign/systemdesign-module').then(m => m.SystemdesignModule)
    },
    //  { path: '', redirectTo: 'systemdesign/buttons', pathMatch: 'full' }, //by default 
    {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin-module').then(m => m.AdminModule),
      },
       { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }, //by default 
  ]
},
  
    

     

];
