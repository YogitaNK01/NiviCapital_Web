import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { AbstractControl, FormArray, FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Uploadbtn, UploadConfig, UploadResult } from "../../../systemdesign/uploadbtn/uploadbtn";
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Edusection } from './edusection/edusection';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Messagebox } from '../../../systemdesign/messagebox/messagebox';
import { Msgboxservice } from '../../../../core/service/msgboxservice';

interface OptionItem {
  label: string;
  value: string;
  code?: string;
}
type StepKey = '10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg' | 'ielts' | 'offerletter' | 'others12' | 'othersdiploma';
type Subcategory = '_10TH' | '_12TH' | 'DIPLOMA' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'IELTS_PTE' | "OFFER_LETTER" | 'OTHER' | 'OTHER_AFTER_DIPLOMA' | 'OTHER_AFTER_12';
// type DocType = 'marksheet' | 'lc';
type ApiType = 'MARKSHEET' | 'SCHOOL_LEAVING_CERT';

interface OptionItem {
  label: string;
  value: string;
  code?: string;
}
type EducationType = 'IELTS_PTE' | 'OFFER_LETTER'


type DocType = 'marksheet' | 'lc' | 'offerletter' | 'ielts' | 'other';

interface RequiredDoc {
  doc: DocType;
  apiType: string;
  title: string;
  index?: number;
}

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, Inputfield, Edusection, Dropdown],
  standalone: true,
  templateUrl: './educationinfo.html',
  styleUrl: './educationinfo.scss'
})
export class Educationinfo implements OnInit {

  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';

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
  @Input() sectionType!: 'school' | 'diploma' | 'bachelors' | 'postgrad';



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

  activeEducation: any;
  otherDocMap: Record<string, { title: string }> = {};
  stepToSubcategory: Record<StepKey, Subcategory> = {
    '10th': '_10TH',
    '12th': '_12TH',
    diploma10: 'DIPLOMA',
    diploma12: 'DIPLOMA',
    ug: 'UNDERGRADUATE',
    pg: 'POSTGRADUATE',
    ielts: 'IELTS_PTE',
    offerletter: 'OFFER_LETTER',
    others12: 'OTHER_AFTER_12',
    othersdiploma: 'OTHER_AFTER_DIPLOMA'
  };

  educationOrder: Array<'10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg' | 'ielts' | 'offerletter' | 'others' | 'others12' | 'othersdiploma'> = ['10th', '12th', 'diploma10', 'diploma12', 'ug', 'pg', 'ielts', 'offerletter', 'others', 'others12', 'othersdiploma'];



  educationForms: any = {};
  basicform!: FormGroup;

  private isEducationFlowInitialized = false;
  uploadedFiles: Record<string, File | null> = {}; // central store

  uploadeddata: any;

  private hasUnsavedChanges = false;


  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private formSvc: Loanformservice,
    private route: ActivatedRoute, private router: Router, private msgbox: Msgboxservice,public main:Main) { }
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;



      if (params['qualificationlabel']) {
        this.activeEducation = params['qualificationlabel'];
      }

    });

    this.getEducationdetails();


    this.educationForms = {
      '10th': this.createForm(),
      '12th': this.createForm(),
      diploma10: this.createForm(),
      diploma12: this.createForm(),
      ug: this.createForm(),
      pg: this.createForm(),
      ielts: this.fb.group({
        score: ['', [Validators.required,Validators.min(4),Validators.max(10)]],
        certificate: [null, Validators.required]
      }),

      offerletter: this.fb.group({
        offerLetter: [null, Validators.required]
      }),
      others12: this.createForm(),
      othersdiploma: this.createForm()
    }

    this.route.queryParams.subscribe(params => {
      const qualificationId = params['qualificationId'];
      if (!qualificationId) return;

      this.selectedID = qualificationId;

      this.formSvc.getselectedEducation(qualificationId).subscribe((res: any) => {
        this.educationdetails = res.data ?? res;

        if (!this.isEducationFlowInitialized) {
          const orderFromApi = this.educationdetails.map((d: any) =>
            this.normalizeQualification(d.qualificationName)
          );

          this.educationOrder = [...new Set([...orderFromApi, 'ielts', 'offerletter'])];
          this.isEducationFlowInitialized = true;

          if (!this.activeEducation) {
            this.activeEducation = this.educationOrder[0];
          }

        }
        this.stepperService.setEducationSubSteps(this.educationdetails);


      });
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


  onEducationSelect(value: any) {
    this.activeEducation = value.label.toLowerCase();
  }

  createForm(): FormGroup {
    return this.fb.group({


      institutename: ['', Validators.required],
      passingyear: ['', Validators.required],
      per_cgpa: ['', Validators.required],
      location: ['', Validators.required],

      marksheet: [null, Validators.required],
      lc: [null, Validators.required],

      score: [''],
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

     


    });
  }

  isOtherSelected(fd: AbstractControl): boolean {
    const selectedId = fd.get('qualification')?.value;
    const found = this.seleactqualification.find(b => b.value === selectedId);
    return found?.label === 'Other';
  }


  normalizeQualification(name: string): string {
    const lower = name.toLowerCase();

    // School
    if (lower === '10th') return '10th';
    if (lower === '12th') return '12th';

    // Diploma
    if (lower.includes('diploma') && lower.includes('10')) return 'diploma10';
    if (lower.includes('diploma') && lower.includes('12')) return 'diploma12';


    // Others (must come BEFORE generic "other")
    if (lower.includes('others') && lower.includes('after 12th')) return 'others12';
    if (lower.includes('others') && lower.includes('diploma')) return 'othersdiploma';


    //PG
    if (lower.includes('postgraduate') || lower.includes('pg') || lower.includes('master')) return 'pg';

    // UG 
    if (lower.includes('undergraduate') || lower.includes('ug') || lower.includes('bachelor')) return 'ug';

    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';
    if (lower.includes('offer')) return 'offerletter';
    if (lower.includes('other')) return 'others';


    return 'others';


  }




  getMarksheetCount(step: StepKey): number {
    if (step === 'diploma10' || step === 'diploma12') return 3; // example
    if (step === 'ug') return 4;   // example
    if (step === 'pg' || step === 'others12' || step === 'othersdiploma') return 2;   // example
    return 0;
  }
  requiredDocs(step: StepKey): RequiredDoc[] {
    if (step === '10th' || step === '12th' || step === 'others12' || step === 'othersdiploma') {
      return [
        { doc: 'marksheet', apiType: 'MARKSHEET', title: 'marksheet' },
        { doc: 'lc', apiType: 'SCHOOL_LEAVING_CERT', title: 'LC' }
      ];
    }

    if (step === 'diploma10' || step === 'diploma12' || step === 'ug' || step === 'pg') {
      const count = this.getMarksheetCount(step);

      const marksheets: RequiredDoc[] = Array.from({ length: count }, (_, i) => ({
        doc: 'marksheet',
        apiType: 'MARKSHEET',
        title: `marksheet ${i + 1}`,
        index: i
      }));

      return [
        ...marksheets,
        { doc: 'lc', apiType: 'SCHOOL_LEAVING_CERT', title: 'LC' }
      ];
    }

    if (step === 'ielts') {
      return [
        { doc: 'ielts', apiType: 'UPLOAD_CERTIFICATE', title: 'ielts' }
      ];
    }

    if (step === 'offerletter') {
      return [
        { doc: 'offerletter', apiType: 'UPLOAD_CERTIFICATE', title: 'offerLetter' }
      ];
    }

    return [];
  }



  buildKey(step: StepKey, doc: DocType, index?: number) {
    return index ? `${step}_${doc}_${index}` : `${step}_${doc}`;
  }

  onSectionFileChange(step: StepKey, doc: DocType, index: number | undefined, result: UploadResult) {
    const key = this.buildKey(step, doc, index);
    this.uploadedFiles[key] = result?.file ?? null;
    this.uploadedFiles = { ...this.uploadedFiles };
  }


  onFileSelectedFromSection(e: {
    step: StepKey;
    control: 'marksheet' | 'lc' | 'other';
    index?: number;
    file: File | null;
    gropudata?: { title?: string };
  }) {
    
const fg = this.educationForms[e.step] as FormGroup;

  fg?.get(e.control)?.setValue(e.file);
  fg?.get(e.control)?.markAsTouched();
  fg?.get(e.control)?.updateValueAndValidity();

    const key = this.buildKey(e.step, e.control, e.index);
    this.uploadedFiles[key] = e.file;
    this.hasUnsavedChanges = true;

    if (e.control === 'other') {
      this.otherDocMap[key] = {
        title: e.gropudata?.title || 'Other Document'
      };
    }

    this.uploadedFiles = { ...this.uploadedFiles };
  }

  getFile(step: StepKey, doc: DocType, index?: number) {
    console.log(this.uploadedFiles);

    return this.uploadedFiles[this.buildKey(step, doc, index)] ?? null;
  }



  back1() {

    if (!this.isEducationFlowInitialized) {
      this.stepperService.previous();
      return;
    }

    const index = this.educationOrder.indexOf(this.activeEducation);
    if (index > 0) {
      const prevEducation = this.educationOrder[index - 1];
      this.activeEducation = prevEducation;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          qualificationlabel: prevEducation
        },
        queryParamsHandling: 'merge'
      });
      return;
    }

    this.router.navigate(
      ['/loanform/educationDetails'],
      {
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.custARN
        }
      }
    );

  }


  back() {
    if (this.hasUnsavedChanges) {
      this.msgbox.open({
        type: 'unsaved',
        title: 'Unsaved changes?',
        message:
          `You have unsaved data in this section.<br> Switching sections will cause your changes to be lost.`,
        okText: 'Yes, Discard',
        cancelText: 'Cancel',
        onOk: () => {
          this.hasUnsavedChanges = false;
          this.performEducationBack();
        }
      });
      return;
    }

    this.performEducationBack();
  }


  private performEducationBack() {

  if (!this.isEducationFlowInitialized) {
    this.stepperService.previous();
    return;
  }

  const index = this.educationOrder.indexOf(this.activeEducation);

  if (index > 0) {
    const prevEducation = this.educationOrder[index - 1];
    this.activeEducation = prevEducation;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        qualificationlabel: prevEducation
      },
      queryParamsHandling: 'merge'
    });

    return;
  }

  this.router.navigate(['/loanform/educationDetails'], {
    queryParams: {
      applicantId: this.applicantId,
      applicationId: this.applicationId,
      custName: this.custName,
      custARN: this.custARN
    }
  });
}

  canProceedToNext(): boolean {
  const step = this.activeEducation as StepKey;
  const form = this.educationForms[step] as FormGroup;

  if (!form) return false;

  if (step === 'ielts') {
    return (
      !!form.get('score')?.value &&
      !!this.getFile(step, 'ielts')
    );
  }

  if (step === 'offerletter') {
    return !!this.getFile(step, 'offerletter');
  }

  return (
    form.valid &&
    !!this.getFile(step, 'marksheet') &&
    !!this.getFile(step, 'lc')
  );
}

  next() {
    console.log("next---");

    const step = this.activeEducation as StepKey;
    this.stepperService.markEducationSectionComplete(step);
    const form = this.educationForms[step];
  
    const fd = new FormData();

    const subcategory = this.stepToSubcategory[step];

    fd.append('category', 'EDUCATION');
    fd.append('subcategory', subcategory);
    fd.append('applicantId', this.applicantId);

    if (step === 'ielts') {

      const score = form.get('score')?.value;
      const file = this.getFile(step, 'ielts');

      if (!score || !file) {
        alert('Please enter score and upload IELTS certificate.');
        return;
      }


      fd.append('score', score);
      fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
      fd.append('files[0].file', file);

    }
    else if (step === 'offerletter') {
      const file = this.getFile(step, 'offerletter');

      if (!file) {
        alert('Please upload offer letter.');
        return;
      }


      // if (file) {
      fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
      fd.append('files[0].file', file);
      // }
    } else {
      const reqDocs = this.requiredDocs(step);

      const missingFiles = reqDocs.filter(r => !this.getFile(step, r.doc as DocType, r.index));
      if (missingFiles.length > 0) {
        alert('Please upload all required documents.');
        return;
      }

      reqDocs.forEach((r, index) => {
        const file = this.getFile(step, r.doc as DocType, r.index);
        if (!file) return;

        fd.append(`files[${index}].type`, r.apiType);
        fd.append(`files[${index}].file`, file);
      });

      let fileIndex = reqDocs.length;

      Object.keys(this.uploadedFiles)
        .filter(key => key.startsWith(`${step}_other_`))
        .forEach(key => {
          const file = this.uploadedFiles[key];
          if (!file) return;

          const meta = this.otherDocMap[key];

          fd.append(`files[${fileIndex}].type`, 'OTHER');
          fd.append(
            `files[${fileIndex}].title`,
            meta?.title || 'Other Document'
          );
          fd.append(`files[${fileIndex}].file`, file);

          fileIndex++;
        });



      fd.append('instituteName', form.get('institutename')?.value || '');
      fd.append('yearOfPassing', form.get('passingyear')?.value || '');
      fd.append('percentageCgpa', form.get('per_cgpa')?.value || '');
      fd.append('location', form.get('location')?.value || '');

    }

    let keysArr = [];
    for (let key of fd.keys()) {
      keysArr.push(key);
    }
    console.log("Uploading Batch:", keysArr);


    this.formSvc.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {
        // reqDocs.forEach(r => this.uploadedFiles[this.buildKey(step, r.doc)] = null);
        this.uploadedFiles = { ...this.uploadedFiles };

        const idx = this.educationOrder.indexOf(step);

        if (idx === -1) {
          console.error('Invalid education step:', step);
          return;
        }

        if (idx < this.educationOrder.length - 1) {
          const nextEducation = this.educationOrder[idx + 1];
          this.activeEducation = nextEducation;

          // this.router.navigate(['/loanform/educationinfo'], {

          this.router.navigate([], {
            relativeTo: this.route,

            queryParams: {
              // qualificationId: this.selectedID,
              qualificationlabel: nextEducation,
              // applicantId: this.applicantId,
              // applicationId: this.applicationId,
              // custName: this.custName,
              // custARN: this.custARN
            },
            queryParamsHandling: 'merge'
          });

        }
        else {
          this.stepperService.next();
        }
      },
      error: (err) => {
        console.error("Upload Failed", err);
        alert("Failed to upload documents.");
      }
    });
  }

  getEducationGroup(key: string): FormGroup {
    return this.educationForm.get(key) as FormGroup;
  }
  onFileChange(step: StepKey, doc: DocType, result: UploadResult) {
    if (!result?.file) return;

    const key = this.buildKey(step, doc);
    this.uploadedFiles[key] = result.file;
    this.uploadedFiles = { ...this.uploadedFiles };
    console.log("this.uploadedFiles--", this.uploadedFiles);

    const fg = this.educationForms[step] as FormGroup;
    fg?.get(doc)?.setValue(result.file);
    fg?.get(doc)?.updateValueAndValidity();
  }

  buildDocKey(level: EducationType, docType: DocType, index?: number): string {
    return index ? `${level}_${docType}_${index}` : `${level}_${docType}`;
  }
  getLocalFileUrl(level: EducationType, docType: DocType, index?: number): string {
    const key = this.buildDocKey(level, docType, index);
    const f = this.uploadedFiles[key] as File | null;
    return f ? URL.createObjectURL(f) : '';
  }

  viewLocal(level: EducationType, docType: DocType, index?: number): void {
    const url = this.getLocalFileUrl(level, docType, index);
    if (url) window.open(url, '_blank');
  }

  removeLocal(level: EducationType, docType: DocType, index?: number): void {
    const key = this.buildDocKey(level, docType, index);
    this.uploadedFiles[key] = null;
    this.uploadedFiles = { ...this.uploadedFiles };
  }

  hasLocalFile(level: EducationType, docType: DocType, index?: number): boolean {
    return !!this.uploadedFiles[this.buildDocKey(level, docType, index)];
  }

  getLocalFileName(level: EducationType, docType: DocType, index?: number): string {
    const f = this.uploadedFiles[this.buildDocKey(level, docType, index)] as File | null;
    return f?.name || '';
  }

  downloadLocal(level: EducationType, docType: DocType, index?: number): void {
    const f = this.uploadedFiles[this.buildDocKey(level, docType, index)] as File | null;
    if (!f) return;

    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  viewImage(url: string): void {
    window.open(url, '_blank');
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
