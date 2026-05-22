import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { AbstractControl, FormArray, FormBuilder, FormGroup, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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

  private educationFormState: Record<string, any> = {};

  uploadeddata: any;

  private hasUnsavedChanges = false;

  private flowQualificationId: string | null = null;


  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private formSvc: Loanformservice,
    private route: ActivatedRoute, private router: Router, private msgbox: Msgboxservice, public main: Main) { }
  ngOnInit(): void {
    //1.create forms for all education types
    this.educationForms = {
      '10th': this.createForm(),
      '12th': this.createForm(),
      diploma10: this.createForm(),
      diploma12: this.createForm(),
      ug: this.createForm(),
      pg: this.createForm(),
      ielts: this.createIeltsForm(),
      offerletter: this.fb.group({
        offerLetter: [null, Validators.required]
      }),
      others12: this.createForm(),
      othersdiploma: this.createForm()
    }
    0    // 2.
    Object.keys(this.educationForms).forEach(step => {
      const form = this.educationForms[step] as FormGroup;

      form.valueChanges.subscribe(() => {
        if (this.activeEducation === step) {
          const raw = form.getRawValue();

          this.educationFormState[step] = {
            ...raw,
            institutename: this.normalizeDropdownValue(raw.institutename),
            location: this.normalizeDropdownValue(raw.location),
            passingyear: this.normalizeDropdownValue(raw.passingyear),
          };

          this.stepperService.setEducationStepData(
            step,
            this.educationFormState[step]
          );

          this.saveEducationStateToLocalStorage();
        }
      });
    });


    //  3. QUERY PARAMS
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;


      // this.restoreEducationStateFromLocalStorage();
      if (params['qualificationlabel']) {

        const step = params['qualificationlabel'] as StepKey;
        if (step) {
          this.activeEducation = step;
          this.restoreFormState(step);
        }

        //   build submenu only when flow qualificationId changes
        const qid = params['qualificationId'];
        if (qid && qid !== this.flowQualificationId) {
          this.flowQualificationId = qid;

          this.formSvc.getselectedEducation(qid).subscribe((res: any) => {
            this.educationdetails = res.data ?? res;

            //   ONLY ONCE per flow
            this.stepperService.setEducationSubSteps(this.educationdetails);

            if (!this.isEducationFlowInitialized) {
              const orderFromApi = this.educationdetails.map((d: any) =>
                this.normalizeQualification(d.qualificationName)
              );

              this.educationOrder = [...new Set([...orderFromApi, 'ielts', 'offerletter'])];
              this.isEducationFlowInitialized = true;
              this.saveEducationStateToLocalStorage();
            }

            // ✅ after API
            this.restoreEducationStateFromLocalStorage();

            if (step) {
              this.activeEducation = step;

              setTimeout(() => {
                this.restoreFormState(step);
              }, 200);
            }
          });
        }

      }

    });

    this.getEducationdetails();

    if (this.selectedLabel.includes('postgraduate') || this.selectedLabel.includes('pg')) {
      this.group.get('institutename')?.clearValidators();
      this.group.get('passingyear')?.clearValidators();
      this.group.get('per_cgpa')?.clearValidators();
      this.group.get('location')?.clearValidators();
      this.group.get('otherLocation')?.clearValidators();

      this.group.get('institutename')?.updateValueAndValidity();
      this.group.get('passingyear')?.updateValueAndValidity();
      this.group.get('per_cgpa')?.updateValueAndValidity();
      this.group.get('location')?.updateValueAndValidity();
      this.group.get('otherLocation')?.updateValueAndValidity();
    }

    // this.route.queryParams.subscribe(params => {
    //   const qualificationId = params['qualificationId'];
    //   if (!qualificationId) return;

    //   this.selectedID = qualificationId;

    //   this.formSvc.getselectedEducation(qualificationId).subscribe((res: any) => {
    //     this.educationdetails = res.data ?? res;

    //     if (!this.isEducationFlowInitialized) {
    //       const orderFromApi = this.educationdetails.map((d: any) =>
    //         this.normalizeQualification(d.qualificationName)
    //       );

    //       this.educationOrder = [...new Set([...orderFromApi, 'ielts', 'offerletter'])];
    //       this.isEducationFlowInitialized = true;

    //       if (!this.activeEducation) {
    //         this.activeEducation = this.educationOrder[0];
    //       }

    //     }
    //     this.stepperService.setEducationSubSteps(this.educationdetails);


    //   });
    // });
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
    this.activeEducation = this.normalizeQualification(value.label.toLowerCase());
  }

  createForm(): FormGroup {
    return this.fb.group({


      institutename: ['', Validators.required],
      institutetitle: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      passingyear: ['', Validators.required],
      per_cgpa: ['', [Validators.required, this.percentageOrCgpaValidator()]],
      location: ['', Validators.required],
      otherLocation: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      marksheet: [null],
      lc: [null],

      // score: ['', [ this.ieltsScoreValidator()]],
    });
  }
  createIeltsForm(): FormGroup {
    return this.fb.group({
      score: ['', [Validators.required, this.ieltsScoreValidator()]],
    });
  }

  percentageOrCgpaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;


      if (value === null || value === undefined || value === '') {
        return null;
      }

      const num = Number(value);
      if (isNaN(num)) {
        return { invalidPerCgpa: true };
      }

      const valueStr = value.toString();

      const isPercentage =
        num >= 35 &&
        num <= 100 &&
        /^\d+(\.\d{1,2})?$/.test(valueStr);

      const isCgpa =
        num >= 4 &&
        num <= 10 &&
        /^\d+(\.\d{1})?$/.test(valueStr);

      return isPercentage || isCgpa
        ? null
        : { invalidPerCgpa: true };
    };
  }
  ieltsScoreValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const num = Number(value);
      if (isNaN(num)) {
        return { invalidIeltsScore: true };
      }

      const valueStr = value.toString();

      //  4.0–10.0
      const isValid =
        num >= 4.0 &&
        num <= 10.0 &&
        /^\d+(\.\d{1})?$/.test(valueStr);

      return isValid ? null : { invalidIeltsScore: true };
    };
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
  normalizeDocType(doc: string): DocType {
    if (doc === 'SCHOOL_LEAVING_CERT') {
      return 'lc';
    }
    if (doc === 'MARKSHEET') {
      return 'marksheet';
    }
    return doc as DocType;
  }



  requiredDocs(step: StepKey): RequiredDoc[] {
    //  PG → No documents required
    // if (step === 'pg') return [];

    //  UG → 2 marksheets + LC
    if (step === 'ug') {
      return [
        { doc: 'marksheet', apiType: 'MARKSHEET', index: 0, title: 'Marksheet 1' },
        { doc: 'marksheet', apiType: 'MARKSHEET', index: 1, title: 'Marksheet 2' },
        { doc: 'lc', apiType: 'SCHOOL_LEAVING_CERT', title: 'LC' }
      ];
    }

    //  10th, 12th, Diploma, Others → 1 marksheet + LC
    return [
      { doc: 'marksheet', apiType: 'MARKSHEET', index: 0, title: 'Marksheet' },
      { doc: 'lc', apiType: 'SCHOOL_LEAVING_CERT', title: 'LC' }
    ];
  }

  buildKey(step: StepKey, doc: DocType, index?: number) {
    return index !== undefined ? `${step}_${doc}_${index}` : `${step}_${doc}`;
  }

  onSectionFileChange(step: StepKey, doc: DocType, index: number | undefined, result: UploadResult) {
    if (!result?.file) return;
    const doc1 = this.normalizeDocType(doc);

    const key = this.buildKey(step, doc1, index ?? 0);
    this.uploadedFiles[key] = result?.file ?? null;
    this.uploadedFiles = { ...this.uploadedFiles };

    this.saveCurrentFormState();
    this.saveEducationStateToLocalStorage();

    this.cd.detectChanges();
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

    const normalizedDoc = this.normalizeDocType(e.control);
    const idx = e.control === 'marksheet' ? (e.index ?? 0) : undefined;
    const key = this.buildKey(e.step, normalizedDoc, idx);
    // const key = this.buildKey(e.step, normalizedDoc, e.index ?? 0);

    // const key = this.buildKey(e.step, e.control, e.index);
    this.uploadedFiles[key] = e.file;
    this.hasUnsavedChanges = true;

    if (e.control === 'other') {
      // this.otherDocMap[key] = {
      //   title: e.gropudata?.title || 'Other Document'
      // };


      const key = `${e.step}_other_${e.index}`;

      if (e.file === null && e.gropudata === null) {
        delete this.otherDocMap[key];
        delete this.uploadedFiles[key];

        this.otherDocMap = { ...this.otherDocMap };
        this.uploadedFiles = { ...this.uploadedFiles };
        this.saveCurrentFormState();
        this.saveEducationStateToLocalStorage();
        return;
      }

      this.otherDocMap[key] = {
        title: e.gropudata?.title ?? ''
      };
      this.uploadedFiles[key] = e.file;



    }

    this.uploadedFiles = { ...this.uploadedFiles };

    this.saveCurrentFormState();
    this.saveEducationStateToLocalStorage();

    console.log("this.uploadedFiles---------", this.uploadedFiles);

    this.cd.detectChanges();
  }

  getFile(step: StepKey, doc: DocType, index?: number) {

    // return this.uploadedFiles[this.buildKey(step, doc, index)] ?? null;

    const normalizedDoc = this.normalizeDocType(doc);
    let data = this.uploadedFiles[this.buildKey(step, normalizedDoc, index)] ?? null;
    // console.log("---------------------", data);

    return data

  }




  //resotre form data
  restoreFormState(step: StepKey) {
    const form = this.educationForms[step];
    const saved = this.educationFormState[step] || this.stepperService.getEducationStepData(step);;

    if (!form || !saved) return;

    form.patchValue(saved, { emitEvent: false });


    setTimeout(() => {
      this.cd.detectChanges();
    });

    form.markAsDirty();
    form.markAsPristine();
    form.updateValueAndValidity({ emitEvent: false });


    // const patchedValue = {
    //   ...saved,
    //   institutename: this.normalizeDropdownValue(saved?.institutename),
    //   location: this.normalizeDropdownValue(saved?.location),
    //   passingyear: this.normalizeDropdownValue(saved?.passingyear),
    // };

    // form.patchValue(patchedValue, { emitEvent: false });

    // setTimeout(() => {
    //   form.get('institutename')?.setValue(patchedValue.institutename, { emitEvent: false });
    //   form.get('location')?.setValue(patchedValue.location, { emitEvent: false });
    //   form.get('passingyear')?.setValue(patchedValue.passingyear, { emitEvent: false });

    //   form.markAsPristine();
    //   form.updateValueAndValidity({ emitEvent: false });
    //   this.cd.detectChanges();
    // }, 300);

  }




  getEducationGroup(key: string): FormGroup {
    return this.educationForm.get(key) as FormGroup;
  }
  onFileChange(step: StepKey, doc: DocType, result: UploadResult) {
    if (!result?.file) return;
    const normalizedDoc = this.normalizeDocType(doc);
    const index = doc === 'marksheet' ? 0 : undefined;

    const key = this.buildKey(step, normalizedDoc, index);
    this.uploadedFiles[key] = result.file;
    this.uploadedFiles = { ...this.uploadedFiles };
    console.log("this.uploadedFiles--", this.uploadedFiles);

    const fg = this.educationForms[step] as FormGroup;
    fg?.get(doc)?.setValue(result.file);
    fg?.get(doc)?.updateValueAndValidity();
    this.cd.detectChanges();
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
    this.msgbox.open({

      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,


      onOk: () => {
        const key = this.buildDocKey(level, docType, index);
        this.uploadedFiles[key] = null;
        this.uploadedFiles = { ...this.uploadedFiles };
        this.cd.detectChanges();
      }
    });
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
  private getEducationProgressKey(): string {
    return `educationProgress_${this.applicantId}`;
  }

  // back btn functionality

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

    this.saveCurrentFormState();
    this.performEducationBack();
  }

  saveCurrentFormState() {
    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step] as FormGroup;

    if (form) {
      this.educationFormState[step] = form.getRawValue();
      this.stepperService.setEducationStepData(
        step,
        form.getRawValue()
      );

    }
    // if (form) {

    //   const raw = form.getRawValue();

    //   const normalized = {
    //     ...raw,
    //     institutename: this.normalizeDropdownValue(raw.institutename),
    //     location: this.normalizeDropdownValue(raw.location),
    //     passingyear: this.normalizeDropdownValue(raw.passingyear),
    //   };

    //   this.educationFormState[step] = normalized;

    //   this.stepperService.setEducationStepData(
    //     step,
    //     normalized
    //   );

    //   this.saveEducationStateToLocalStorage();
    // }
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
      this.restoreFormState(this.activeEducation);
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
  private persistEducationState() {
    sessionStorage.setItem(
      'educationState',
      JSON.stringify({
        forms: this.educationFormState,
        active: this.activeEducation,
        uploadedFiles: Object.keys(this.uploadedFiles).reduce((acc, key) => {
          const f = this.uploadedFiles[key];
          if (f) {
            acc[key] = { name: f.name };
          }
          return acc;
        }, {} as any)
      })
    );
  }


  //-----------------disable next btn --------------------

  canProceedToNext(): boolean {
    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step];


    if (!form) return false;

    //  PG → Nothing mandatory
    if (step === 'pg') return true;

    //  IELTS
    if (step === 'ielts') {
      return (
        form.valid &&
        !!this.getFile(step, 'ielts')
      );
    }

    //  Offer Letter
    if (step === 'offerletter') {
      return !!this.getFile(step, 'offerletter');
    }

    if (form.invalid) return false;


    const otherDocs = this.getOtherDocumentsForStep(step);


    if (otherDocs.length > 0) {
      const invalid = otherDocs.some(doc => !doc.title || !doc.file);
      if (invalid) return false;
    }

    //  Required documents check
    const reqDocs = this.requiredDocs(step);

    return reqDocs.every(doc =>
      !!this.getFile(step, doc.doc, doc.index)
    );
  }
  showValidationErrors(step: StepKey): void {
    const form = this.educationForms[step] as FormGroup | undefined;

    if (form) {
      (Object.values(form.controls) as AbstractControl[]).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
    }

    const missingDocs = this.requiredDocs(step).filter(doc =>
      !this.getFile(step, doc.doc, doc.index)
    );

    let message = 'Please fill all required fields';

    if (missingDocs.length) {
      message += ' and upload required documents.';
    } else {
      message += '.';
    }


  }
  private getOtherDocumentsForStep(step: StepKey) {
    return Object.keys(this.otherDocMap)
      .filter(key => key.startsWith(`${step}_other_`))
      .map(key => ({
        title: this.otherDocMap[key]?.title,
        file: this.uploadedFiles[key]
      }));
  }
  onOtherDocAdded(rowId: number) {
    const step = this.activeEducation as StepKey;
    const key = `${step}_other_${rowId}`;

    this.otherDocMap[key] = { title: '' };
    this.uploadedFiles[key] = null;
  }
  //check for pg data
  private hasPgData(form: FormGroup, step: StepKey): boolean {

    const hasFormValue = Object.values(form.getRawValue() || {}).some(
      v => v !== null && v !== undefined && v !== ''
    );

    // check uploaded files (required + other)
    const hasFiles =
      this.requiredDocs(step).some(r => this.getFile(step, r.doc, r.index)) ||
      Object.keys(this.uploadedFiles).some(
        key => key.startsWith(`${step}_`) && !!this.uploadedFiles[key]
      );

    return hasFormValue || hasFiles;
  }

  private getEducationStateKey(): string {
    return `educationState_${this.applicantId}`;
  }

  private saveEducationStateToLocalStorage() {
    if (!this.applicantId) return;

    const forms: Record<string, any> = {};

    Object.keys(this.educationForms).forEach(step => {

      
       const form = this.educationForms[step];
      if (form) {
        forms[step] = form.getRawValue();
      }

      //       const form = this.educationForms[step];
      //       if (form) {

      //  const raw = form.getRawValue();

      //     forms[step] = {
      //       ...raw,
      //       institutename: this.normalizeDropdownValue(raw.institutename),
      //       location: this.normalizeDropdownValue(raw.location),
      //       passingyear: this.normalizeDropdownValue(raw.passingyear),
      //     };
      // }

      // const currentForm = this.educationForms[step];
      // const raw = currentForm?.getRawValue();
      // const savedState = this.educationFormState[step];
      // const data = savedState || raw;

      // if (!data) return;

      // forms[step] = {
      //   ...data,
      //   institutename: this.normalizeDropdownValue(data?.institutename),
      //   location: this.normalizeDropdownValue(data?.location),
      //   passingyear: this.normalizeDropdownValue(data?.passingyear),
      // };


    });

    const uploadedFileMeta: Record<string, any> = {};

    Object.keys(this.uploadedFiles).forEach(key => {
      const file: any = this.uploadedFiles[key];

      if (file) {
        uploadedFileMeta[key] = {
          name: file.name || file.fileName || '',
          uploaded: !(file instanceof File)
        };
      }
    });

    const payload = {
      activeEducation: this.activeEducation,
      educationFormState: forms,
      uploadedFileMeta,
      otherDocMap: this.otherDocMap,
      educationOrder: this.educationOrder
    };

    localStorage.setItem(this.getEducationStateKey(), JSON.stringify(payload));
  }
  private restoreEducationStateFromLocalStorage() {
    if (!this.applicantId) return;

    const saved = localStorage.getItem(this.getEducationStateKey());
    if (!saved) return;

    const parsed = JSON.parse(saved);

    this.educationFormState = parsed.educationFormState || {};
    this.otherDocMap = parsed.otherDocMap || {};

    if (parsed.educationOrder?.length) {
      this.educationOrder = parsed.educationOrder;
    }

    if (parsed.activeEducation) {
      this.activeEducation = parsed.activeEducation;
    }

    Object.keys(this.educationFormState).forEach(step => {
      const form = this.educationForms[step];

      if (form) {
        const savedValue = this.educationFormState[step];

        const patchedValue = {
          ...savedValue,
          institutename: this.normalizeDropdownValue(savedValue?.institutename),
          location: this.normalizeDropdownValue(savedValue?.location),
          passingyear: this.normalizeDropdownValue(savedValue?.passingyear),
        };

        // form.patchValue(patchedValue, {
        //   emitEvent: false
        // });

        this.educationFormState = parsed.educationFormState || {};
        this.otherDocMap = parsed.otherDocMap || {};

        if (parsed.activeEducation) {
          this.activeEducation = parsed.activeEducation;
        }
      }
    });

    if (parsed.uploadedFileMeta) {
      Object.keys(parsed.uploadedFileMeta).forEach(key => {
        this.uploadedFiles[key] = parsed.uploadedFileMeta[key] as any;
      });

      this.uploadedFiles = { ...this.uploadedFiles };
    }

    this.cd.detectChanges();
  }
  private normalizeDropdownValue(value: any): any {
    if (Array.isArray(value)) {
      return value.length ? value[0] : '';
    }

    return value ?? '';
  }
  next() {
    console.log("next---");

    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step];

    // 
    if (step === 'pg' && !this.hasPgData(form, step)) {
      const idx = this.educationOrder.indexOf(step);
      const nextEducation = this.educationOrder[idx + 1];

      this.activeEducation = nextEducation;
      this.restoreFormState(this.activeEducation);

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          qualificationlabel: nextEducation
        },
        queryParamsHandling: 'merge'
      });

      return;
    }



    if (!this.canProceedToNext()) {
      this.showValidationErrors(step);
      return;
    }
    this.saveCurrentFormState();
    this.persistEducationState();

    this.stepperService.setEducationStepData(
      step,
      // this.educationFormState[step]
      this.educationForms[step].getRawValue()
    );



    this.stepperService.markEducationSectionComplete(step);

    //   ALSO mark ALL previous steps as completed
    const index = this.educationOrder.indexOf(step);

    for (let i = 0; i <= index; i++) {
      const prevStep = this.educationOrder[i];
      this.stepperService.markEducationSectionComplete(prevStep);
    }




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
      console.log('reqdoc-', reqDocs);


      if (step !== 'pg') {
        const missingFiles = reqDocs.filter(r => !this.getFile(step, r.doc, r.index));
        if (missingFiles.length > 0) {
          alert('Please upload all required documents.');
          return;
        }
      }


      reqDocs.forEach((r, index) => {
        const file = this.getFile(step, r.doc as DocType, r.index);
        if (!file) return;

        fd.append(`files[${index}].type`, r.apiType);
        fd.append(`files[${index}].file`, file);
      });

      let fileIndex = reqDocs.length;


      //  ADD EXTRA MARKSHEETS (after required ones)
      Object.keys(this.uploadedFiles)
        .filter(key =>
          key.startsWith(`${step}_marksheet_`)
        )
        .forEach(key => {
          const file = this.uploadedFiles[key];
          if (!file) return;


          const isRequired = key.includes('marksheet1') || key.includes('marksheet_0');
          if (isRequired) return;

          fd.append(`files[${fileIndex}].type`, 'MARKSHEET');
          fd.append(`files[${fileIndex}].file`, file);

          fileIndex++;
        });


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

      fd.append('instituteId', form.get('institutename')?.value);
      fd.append('title', form.get('institutetitle')?.value);
      fd.append('yearOfPassing', form.get('passingyear')?.value);
      fd.append('percentageCgpa', form.get('per_cgpa')?.value);
      fd.append('locationId', form.get('location')?.value);
      fd.append('otherLocation', form.get('otherLocation')?.value);

    }

    let keysArr = [];
    for (let key of fd.keys()) {
      keysArr.push(key);
    }
    console.log("Uploading Batch:", keysArr);


    this.formSvc.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {


        this.hasUnsavedChanges = false;

        this.saveCurrentFormState();
        this.saveEducationStateToLocalStorage();

        this.uploadedFiles = { ...this.uploadedFiles };
        this.cd.detectChanges();
        const idx = this.educationOrder.indexOf(step);

        if (idx === -1) {
          console.error('Invalid education step:', step);
          return;
        }

        if (idx < this.educationOrder.length - 1) {
          const nextEducation = this.educationOrder[idx + 1];
          this.activeEducation = nextEducation;
          this.restoreFormState(this.activeEducation);
          // this.router.navigate(['/loanform/educationinfo'], {

          this.router.navigate([], {
            relativeTo: this.route,

            queryParams: {
              qualificationlabel: nextEducation,

            },
            queryParamsHandling: 'merge'
          });

        }
        else {
          this.stepperService.markStepCompleted('educationDetails');
          this.stepperService.next();
        }
      },
      error: (err) => {
        console.error("Upload Failed", err);
        alert("Failed to upload documents.");
      }
    });
  }


}
