import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Uploadbtn, UploadConfig, UploadResult } from "../../../systemdesign/uploadbtn/uploadbtn";
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn,Radiobuttons],
  standalone: true,
  templateUrl: './educationinfo.html',
  styleUrl: './educationinfo.scss'
})
export class Educationinfo {
  
  constructor(private fb: FormBuilder, public main: Main,private stepperService:Loanstepperservice) { }

    back(){
    this.stepperService.previous();
  }
   next() {
  this.stepperService.next();
}

}
