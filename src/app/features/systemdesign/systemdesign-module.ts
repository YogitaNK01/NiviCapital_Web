import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemdesignRoutingModule } from './systemdesign-routing-module';

import { Buttons } from '../systemdesign/buttons/buttons';
import { Charts } from './charts/charts';
import { Areacharts } from './areacharts/areacharts';
import { Barcharts } from './barcharts/barcharts';
import { Checkbox } from './checkbox/checkbox';
import { Dropdown } from './dropdown/dropdown';
import { Inputfield } from './inputfield/inputfield';
import { Radiobuttons } from './radiobuttons/radiobuttons';
import { Uploadbtn } from './uploadbtn/uploadbtn';


@NgModule({
  declarations: [
   
  ],
  imports: [
    CommonModule,
    SystemdesignRoutingModule,
    
   
  ]
})
export class SystemdesignModule { }
