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

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn, Radiobuttons, Inputfield],
  standalone: true,
  templateUrl: './educationinfo.html',
  styleUrl: './educationinfo.scss'
})
export class Educationinfo implements OnInit {
  uploadedFiles= {};
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
      
        tenth: this.createSingleEducation(),
        twelth: this.createSingleEducation(),
        // bachelors: this.createHigherEducation(6), // 6 semesters
        // postgrad: this.createHigherEducation(4)
      
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
onFileChange(result: UploadResult,groupName: string,controlName: string) {
  if (!result?.file) return;

  this.educationForm
    .get(`${groupName}.${controlName}`)
    ?.setValue(result.file);
}

 

  createSingleEducation(): FormGroup {
    return this.fb.group({
      institutename: ['', Validators.required],
      passingyear: ['', Validators.required],
      per_cgpa: ['', Validators.required],
      location: ['', Validators.required],
      marksheet: [null, Validators.required],
      schoolLeavingCertificate: [null]
    });
  }
  createHigherEducation(semCount: number): FormGroup {
    return this.fb.group({
      institutename: ['', Validators.required],
      passingyear: ['', Validators.required],
      per_cgpa: ['', Validators.required],
      location: ['', Validators.required],
      marksheets: this.fb.array(
        Array.from({ length: semCount }, () =>
          this.fb.control(null, Validators.required)
        )
      )
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
