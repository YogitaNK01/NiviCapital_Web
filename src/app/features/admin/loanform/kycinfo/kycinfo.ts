import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Uploadbtn } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Datepicker } from '../../../systemdesign/datepicker/datepicker';
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Buttons } from '../../../systemdesign/buttons/buttons';

@Component({
  selector: 'app-kycinfo',
  imports: [CommonModule,Uploadbtn,Inputfield,Datepickernew,Checkbox,ReactiveFormsModule,Buttons],
  templateUrl: './kycinfo.html',
  styleUrl: './kycinfo.scss'
})
export class Kycinfo {

   openIndex: number[] = [0, 1];
  accordions = [
    { title: 'Identity & Residency ', alwaysOpen: true },
    { title: 'Permanent Address ', alwaysOpen: false },
    { title: 'Current Address ', alwaysOpen: false },
  ];
 kycdocumentsForm!: FormGroup

constructor(private fb: FormBuilder,private stepperService:Loanstepperservice){}

ngOnInit(): void {
    this.kycdocumentsForm = this.fb.group({

      adhaearnumber: ['', Validators.required],
      pannumber: ['', Validators.required, ],
      passportnumber: ['', Validators.required, ],
     dob: ['', Validators.required, ],


    });
  }

  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
  }

  submit() {
   
  }

   back(){
    this.stepperService.previous();
  }
next(){
    this.stepperService.next();
  }
}
