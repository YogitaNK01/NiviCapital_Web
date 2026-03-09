import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { FormArray, FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Uploadbtn, UploadConfig, UploadResult } from "../../../systemdesign/uploadbtn/uploadbtn";
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Edusection } from './edusection/edusection';

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, Inputfield, Edusection],
  standalone: true,
  templateUrl: './educationinfo.html',
  styleUrl: './educationinfo.scss'
})
export class Educationinfo implements OnInit {
  uploadedFiles = {};
  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };

  openIndex: number[] = [0];
  accordions = [
    { title: '10th Document ', alwaysOpen: true },
    { title: '12th Document ', alwaysOpen: false },
    { title: 'Bachelors / Undergraduate ', alwaysOpen: false },
    { title: 'Postgraduate ', alwaysOpen: false },
    { title: 'IELTS / PTE ', alwaysOpen: false },
    { title: 'University Offer Letter ', alwaysOpen: false },
  ];
  educationForm!: FormGroup

  @Input() group!: FormGroup;
  @Input() title!: string;
  @Input() isHigher: boolean = false;
@Input() sectionType!: 'school' | 'bachelors' | 'postgrad';



  //dropdowns
  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  passingyear: string = 'Year of Passing';
  selectpassingyr: DropdownOption[] = [
    { label: 'Loan', value: 'Loan', icon: '' },
  ];


  per_cgpa: string = 'Percentage / CGPA ';
  selectpercentage: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]

  location: string = 'Location';
  selectlocation: DropdownOption[] = [
    { label: 'abc', value: 'educationloan', icon: '' },
  ]

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.educationForm = this.fb.group({

      tenth: this.createSchoolGroup(),
    twelfth: this.createSchoolGroup(),
    bachelors: this.createUGGroup(),
    postgrad: this.createPGGroup(),
     

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
    window.open(url, '_blank');
  }
  downloadImage(url: string): void {
    window.open(url, '_blank');
  }

  back() {
    this.stepperService.previous();
  }
  next() {
    this.stepperService.next();
  }

getEducationGroup(key: string): FormGroup {
  return this.educationForm.get(key) as FormGroup;
}
  onFileChange(result: UploadResult, controlName: string) {
    if (!result?.file) return;

   
  }

createSchoolGroup(): FormGroup {
  return this.fb.group({
    institutename: [''],
    passingyear: [''],
    per_cgpa: [''],
    location: [''],
    marksheet: [null],
    lc: [null]
  });
}

createUGGroup(): FormGroup {
  return this.fb.group({
    institutename: [''],
    passingyear: [''],
    per_cgpa: [''],
    location: [''],
    sem1: [null],
    sem2: [null],
    sem3: [null],
    sem4: [null],
    sem5: [null]
  });
}

createPGGroup(): FormGroup {
  return this.fb.group({
    institutename: [''],
    passingyear: [''],
    per_cgpa: [''],
    location: [''],
    sem1: [null],
    sem2: [null],
    sem3: [null]
  });
}



  get educationDetails(): FormArray {
    return this.educationForm.get('educationDetails') as FormArray;
  }

  onMarksheetUpload(event: any, eduIndex: number, semIndex: number) {
    const marksheets = this.educationDetails
      .at(eduIndex)
      .get('marksheets') as FormArray;

    marksheets.at(semIndex).setValue(event.file);
  }
  addotherdocuments() {

  }
}
