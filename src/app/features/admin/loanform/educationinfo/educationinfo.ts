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
import { Loanformservice } from '../../../../core/service/loanformservice';
import { ActivatedRoute, Router } from '@angular/router';

interface OptionItem {
  label: string;
  value: string;
  code?: string;
}

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, Inputfield, Edusection, Dropdown],
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
  qualification: string = 'Last Qualification';
  seleactqualification: OptionItem[] = []

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

  selectedLabel = '';
  selectedID = '';

  educationdetails: any;


  qualificationId!: string;

  tenthForm!: FormGroup;
  twelfthForm!: FormGroup;

  activeEducation!: '10th' | '12th' |'diploma10' | 'diploma12' | 'ug' | 'pg';

  educationOrder: Array<'10th' | '12th' |'diploma10' | 'diploma12' | 'ug' | 'pg'> = ['10th', '12th', 'diploma10', 'diploma12', 'ug', 'pg'];

  educationForms: any = {};

  hideheader: boolean = false;
  private isEducationFlowInitialized = false;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private formSvc: Loanformservice,
    private route: ActivatedRoute, private router: Router) { }
  ngOnInit(): void {
    this.getEducationdetails();



    // this.educationForms1 = {
    //   tenth: this.createForm(),
    //   twelth: this.createForm(),
    //   ug: this.createForm(),
    //   pg: this.createForm(),
    // };

    this.educationForms = {
      tenth: this.createForm(),
      twelth: this.createForm(),
      diploma10: this.createForm(),
      diploma12: this.createForm(),
      ug: this.createForm(),
      pg: this.createForm(),
      ielts: this.createForm(),
      offerletter: this.createForm(),
      others: this.createForm()
    };
    ``

  }

  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    this.cd.detectChanges();
  }


  onEducationSelect(value: any) {
    this.activeEducation = value.label.toLowerCase();
  }

  createForm(): FormGroup {
    return this.fb.group({
      institutename: [''],
      passingyear: [''],
      per_cgpa: [''],
      location: [''],
      marksheet: [''],
      lc: [''],
    });
  }


  submit() {

  }
  getEducationdetails() {
    this.formSvc.getEducation().subscribe((res: any) => {
      const list = res.data ?? res;

      this.seleactqualification = list.map((s: any) => ({
        value: s.qualificationId,
        label: s.qualificationName,

      }));
    });
  }


  Selectededucation(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.seleactqualification.filter(s =>
      ids.includes(s.value)
    );

    this.selectedLabel = selected.map(s => s.label).join(', ');
    this.selectedID = selected.map(s => s.value).join(', ');

    this.formSvc.getselectedEducation(this.selectedID).subscribe((res: any) => {
      this.educationdetails = res.data ?? res;

      this.stepperService.setEducationSubSteps(this.educationdetails);

      this.educationOrder = this.educationdetails.map((d: any) =>
        this.normalizeQualification(d.qualificationName)
      );
      console.log(this.educationOrder);


    });
  }


  openEducationSubStep(sub: any, event: Event) {
    event.stopPropagation();

    this.router.navigate(['/loanform/educationinfo'], {
      queryParams: {
        edu: sub.label.toLowerCase()
      }
    });
  }

  normalizeQualification(name: string): string {
    const lower = name.toLowerCase();

    // School
    if (lower === '10th') return '10th';
    if (lower === '12th') return '12th';

    // Diploma
    if (lower.includes('diploma') && lower.includes('10')) return 'diploma10';
    if (lower.includes('diploma') && lower.includes('12')) return 'diploma12';

    // UG
    if (lower.includes('undergraduate')) return 'ug';

    // PG
    if (lower.includes('postgraduate')) return 'pg';

    // IELTS / PTE
    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';

    // Offer letter / Others
    if (lower.includes('offer')) return 'offerletter';
    if (lower.includes('others')) return 'others';

    console.warn('Unknown qualification:', name);
    return 'others';
  }

  normalizeQualification1(name: string): string {
    const lower = name.toLowerCase();

    if (lower.includes('10')) return '10th';
    if (lower.includes('12')) return '12th';
    if (lower.includes('diploma') && lower.includes('12')) return 'Diploma (After 12th)';
    if (lower.includes('diploma') && lower.includes('10')) return 'Diploma (After 10th)';
    if (lower.includes('ug') || lower.includes('bachelor')) return 'ug';
    if (lower.includes('pg') || lower.includes('post')) return 'pg';
    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';
    if (lower.includes('offer')) return 'offerletter';

    return lower.replace(/\s+/g, '');
  }


  get isNextDisabled(): boolean {
    if (!this.educationdetails) {
      return true;
    }
    return false;
  }
  back() {
    if (!this.isEducationFlowInitialized) {
      this.stepperService.previous();
      return;
    }

    const index = this.educationOrder.indexOf(this.activeEducation);

    if (index > 0) {
      this.activeEducation = this.educationOrder[index - 1];
      return;
    }

    this.stepperService.previous();
  }

  next() {
    if (!this.isEducationFlowInitialized) {

      if (!this.educationOrder?.length) {
        return;
      }
      this.isEducationFlowInitialized = true;
      this.activeEducation = this.educationOrder[0];
      this.hideheader = true;

      return;
    }



    const index = this.educationOrder.indexOf(this.activeEducation);
    const currentForm = this.educationForms[this.activeEducation];

    if (currentForm?.invalid) {
      currentForm.markAllAsTouched();
      return;
    }

    if (index < this.educationOrder.length - 1) {
      this.activeEducation = this.educationOrder[index + 1];
      return;
    }

    this.stepperService.next();
  }
  next1() {
    this.stepperService.setEducationSubSteps(this.educationdetails);

    this.educationOrder = this.educationdetails.map((d: any) =>
      this.normalizeQualification(d.qualificationName)
    );


    if (this.educationOrder.length) {
      this.activeEducation = this.educationOrder[0];
    }

    this.hideheader = true;
    const currentIndex =
      this.educationOrder.indexOf(this.activeEducation);

    const currentForm = this.educationForms[this.activeEducation];
    if (currentForm?.invalid) {
      currentForm.markAllAsTouched();
      return;
    }


    if (currentIndex < this.educationOrder.length - 1) {
      this.activeEducation = this.educationOrder[currentIndex + 1];
      return;
    }

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
