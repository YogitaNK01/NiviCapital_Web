import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Datepicker } from '../../../systemdesign/datepicker/datepicker';
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Buttons } from '../../../systemdesign/buttons/buttons';

@Component({
  selector: 'app-kycinfo',
  imports: [CommonModule, Uploadbtn, Inputfield, Datepickernew, Checkbox, ReactiveFormsModule, Buttons],
  standalone: true,
  templateUrl: './kycinfo.html',
  styleUrl: './kycinfo.scss'
})
export class Kycinfo {

  openIndex: number[] = [0];
  accordions = [
    { title: 'Identity & Residency ', alwaysOpen: true },
    { title: 'Permanent Address ', alwaysOpen: false },
    { title: 'Current Address ', alwaysOpen: false },
  ];
  kycdocumentsForm!: FormGroup

  ispassport: boolean = false;
  uploadedFiles: Record<string, File | null> = {};
  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };


  isPermanentMailingChecked = true;
  isCurrentMailingChecked = false;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.kycdocumentsForm = this.fb.group({


      adhaarnumber: ['', Validators.required],
      adhaarfront: ['', Validators.required],
      adhaarback: ['', Validators.required],
      pannumber: ['', Validators.required,],
      passportnumber: ['', Validators.required,],
      dob: ['', Validators.required,],
      peraddressline1: ['', Validators.required],
      peraddressline2: ['', Validators.required],
      peraddressline3: ['', Validators.required],
      percountry: ['', Validators.required],
      perstate: ['', Validators.required,],
      percity: ['', Validators.required,],
      perpincode: ['', Validators.required,],
      
      curraddressline1: ['', Validators.required],
      curraddressline2: ['', Validators.required],
      curraddressline3: ['', Validators.required],
      currcountry: ['', Validators.required],
      currstate: ['', Validators.required,],
      currcity: ['', Validators.required,],
      currpincode: ['', Validators.required,],



    });
  }

  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    this.cd.detectChanges();
  }

  submit() {

  }

  viewImage(url: string): void {
    // ✅ Opens image in a new browser tab
    window.open(url, '_blank');
  }
  downloadImage(url: string): void {
    // ✅ Opens image in a new browser tab
    window.open(url, '_blank');
  }

  back() {
    this.stepperService.previous();
  }
  next() {
    this.stepperService.next();
  }

  onFileChange(result: UploadResult, key: string) {

    if (!result.file) {
      this.uploadedFiles[key] = null;
      return;
    }

    this.files[key] = result.file;
    this.uploadedFiles[key] = result.file;

  }
}
