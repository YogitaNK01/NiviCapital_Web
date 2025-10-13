import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Buttons } from './buttons/buttons';
import { Charts } from './charts/charts';
import { Areacharts } from './areacharts/areacharts';
import { Barcharts } from './barcharts/barcharts';
import { Checkbox } from './checkbox/checkbox';
import { Dropdown } from './dropdown/dropdown';
import { Inputfield } from './inputfield/inputfield';
import { Radiobuttons } from './radiobuttons/radiobuttons';
import { Uploadbtn } from './uploadbtn/uploadbtn';
import { Design } from './design/design';
import { Layout } from '../../core/layout/layout';

const routes: Routes = [
    {
    path: '',
    children: [
      { path: 'buttons', component: Design, data: { section: 'buttons' } },
      { path: 'checkbox', component: Design, data: { section: 'checkbox' } },
      { path: 'charts', component: Design, data: { section: 'charts' } },
      { path: 'dropdown', component: Design, data: { section: 'dropdown' } },
      { path: 'inputfield', component: Design, data: { section: 'inputfield' } },
      { path: 'radiobuttons', component: Design, data: { section: 'radiobuttons' } },
      { path: 'uploadbuttons', component: Design, data: { section: 'uploadbuttons' } },
      { path: '', redirectTo: 'buttons', pathMatch: 'full' } // default child route
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemdesignRoutingModule { }
