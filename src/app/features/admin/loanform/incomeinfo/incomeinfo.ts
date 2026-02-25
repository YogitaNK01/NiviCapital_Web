import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-incomeinfo',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn, Radiobuttons, Inputfield],
  standalone: true,
  templateUrl: './incomeinfo.html',
  styleUrl: './incomeinfo.scss'
})
export class Incomeinfo {
uploadedFiles = {};
  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };

  openIndex: number | null = 0;
  accordions = [
    { title: 'Income Details ', alwaysOpen: true },
  ];

  incomeForm!: FormGroup
  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.incomeForm = this.fb.group({

     

    });
  }

   toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

   onFileChange(result: UploadResult, controlName: string) {
    if (!result.file) {
      
      return;
    }
  
    // this.group.get(controlName)?.setValue(result.file);
  }
  
  submit(){}

  addotherdocuments(){}
    back(){
    this.stepperService.previous();
  }
   next() {
  this.stepperService.next();
}
}
