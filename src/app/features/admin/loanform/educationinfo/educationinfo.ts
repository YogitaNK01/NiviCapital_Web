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
import { forkJoin, of } from 'rxjs';
import { Messagebox } from '../../../systemdesign/messagebox/messagebox';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { catchError, map } from 'rxjs/operators';


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
type ApiDocumentType =
  | 'MARKSHEET'
  | 'SCHOOL_LEAVING_CERT'
  | 'OTHER'
  | 'UPLOAD_CERTIFICATE'
  | 'IELTS'
  | 'OFFERLETTER';

@Component({
  selector: 'app-educationinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, Inputfield, Edusection, Dropdown],
  standalone: true,
  templateUrl: './educationinfo.html',
  styleUrl: './educationinfo.scss'
})
export class Educationinfo implements OnInit {

  applicantId: any;
  applicationId: any;
  custName: any;
  custARN: any;

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
  // savedFileMeta: Record<string, any> = {};
  private educationFormState: Record<string, any> = {};

  uploadeddata: any;

  private hasUnsavedChanges = false;

  private flowQualificationId: string | null = null;

  lastSavedPayload: any = null;

  @Input() savedFileMeta: Record<string, any> = {};

  //save exit 
  private educationSectionKeyMap: Record<string, string> = {
    '10th': 'BATCH_UPLOAD_10',
    '12th': 'BATCH_UPLOAD_12',

    diploma10: 'BATCH_UPLOAD_DIPLOMA',
    diploma12: 'BATCH_UPLOAD_DIPLOMA',

    ug: 'BATCH_UPLOAD_UNDERGRADUATE',
    pg: 'BATCH_UPLOAD_POSTGRADUATE',

    ielts: 'BATCH_UPLOAD_IELTS_PTE',
    offerletter: 'BATCH_UPLOAD_OFFER_LETTER',

    others12: 'BATCH_UPLOAD_12',
    othersdiploma: 'BATCH_UPLOAD_DIPLOMA'
  };
  //draft
  private readonly educationDraftGetRequests = [
    {
      step: '10th',
      sectionKey: 'BATCH_UPLOAD_10',
      category: 'EDUCATION',
      subcategory: '_10TH',
      documentType: 'MARKSHEET'
    },
    {
      step: '12th',
      sectionKey: 'BATCH_UPLOAD_12',
      category: 'EDUCATION',
      subcategory: '_12TH',
      documentType: 'MARKSHEET'
    },
    {
      step: 'diploma10',
      sectionKey: 'BATCH_UPLOAD_DIPLOMA',
      category: 'EDUCATION',
      subcategory: 'DIPLOMA',
      documentType: 'MARKSHEET'
    },
    {
      step: 'ug',
      sectionKey: 'BATCH_UPLOAD_UNDERGRADUATE',
      category: 'EDUCATION',
      subcategory: 'UNDERGRADUATE',
      documentType: 'MARKSHEET'
    },
    {
      step: 'pg',
      sectionKey: 'BATCH_UPLOAD_POSTGRADUATE',
      category: 'EDUCATION',
      subcategory: 'POSTGRADUATE',
      documentType: 'MARKSHEET'
    },
    {
      step: 'ielts',
      sectionKey: 'BATCH_UPLOAD_IELTS_PTE',
      category: 'EDUCATION',
      subcategory: 'IELTS_PTE',
      documentType: 'UPLOAD_CERTIFICATE'
    },
    {
      step: 'offerletter',
      sectionKey: 'BATCH_UPLOAD_OFFER_LETTER',
      category: 'EDUCATION',
      subcategory: 'OFFER_LETTER',
      documentType: 'UPLOAD_CERTIFICATE'
    }
  ];




  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private formSvc: Loanformservice,private msgBox:Msgboxservice,
    private route: ActivatedRoute, private router: Router, private msgbox: Msgboxservice, public main: Main) { }
  ngOnInit(): void {

    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];

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

    //  2. QUERY PARAMS
    this.route.queryParams.subscribe(params => {


      if (params['qualificationlabel']) {

        const step = params['qualificationlabel'] as StepKey;




        this.activeEducation = step;

        this.restoreEducationStateFromLocalStorage();
        setTimeout(() => {
          this.restoreFormState(step);
          this.loadSavedEducationInfoFromApi(step);
        }, 200)



        // this.loadAllEducationDrafts();

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



            setTimeout(() => {
              this.restoreFormState(step);
            }, 200);

          });
        }

      }

    });

    // 3.
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

  getFile1(step: StepKey, doc: DocType, index?: number) {

    // return this.uploadedFiles[this.buildKey(step, doc, index)] ?? null;

    const normalizedDoc = this.normalizeDocType(doc);
    let data = this.uploadedFiles[this.buildKey(step, normalizedDoc, index)] ?? null;
    // console.log("---------------------", data);

    return data

  }

  getFile(step: StepKey, doc: DocType, index?: number) {
    return this.getStoredFileMeta(step, doc, index);
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

  }


  //------------convert viewurl to binary file
  async urlToFile(url: string, filename: string) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new File([blob], filename, {
      type: blob.type || 'image/jpeg'
    });
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
    // return index ? `${level}_${docType}_${index}` : `${level}_${docType}`;

    return index !== undefined
      ? `${level}_${docType}_${index}`
      : `${level}_${docType}`

  }
  getLocalFileUrl(level: EducationType, docType: DocType, index?: number): string {
    const key = this.buildDocKey(level, docType, index);
    const f = this.uploadedFiles[key] as File | null;
    return f ? URL.createObjectURL(f) : '';
  }

  viewLocal1(level: EducationType, docType: DocType, index?: number): void {
    const url = this.getLocalFileUrl(level, docType, index);
    if (url) window.open(url, '_blank');
  }
  viewLocal2(level: any, docType: DocType, index?: number): void {
    const key = this.buildKey(level as StepKey, this.normalizeDocType(docType), index);

    const file = this.uploadedFiles[key];

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      return;
    }

    const savedUrl = this.getSavedFileUrl(key);

    if (savedUrl) {
      window.open(savedUrl, '_blank');
    }
  }
  viewLocal(level: any, docType: DocType, index?: number): void {
    const file: any = this.getStoredFileMeta(
      level as StepKey,
      docType,
      index
    );

    if (!file) return;

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    const url =
      file.viewUrl ||
      file.fileUrl ||
      file.publicUrl ||
      '';

    if (url) {
      window.open(url, '_blank');
    }
  }
  private getSavedFileUrl(key: string): string {
    const meta = this.savedFileMeta[key];

    const url = meta?.viewUrl || meta?.fileUrl || meta?.publicUrl || '';

    if (!url || url === 'NA') return '';

    return url;
    // if (url.startsWith('http')) {
    //   return url;
    // }

    // return `${window.location.origin}${url}`;
  }
  removeLocal1(level: EducationType, docType: DocType, index?: number): void {
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
  removeLocal(level: any, docType: DocType, index?: number): void {
    this.msgbox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {
        const key = this.buildKey(level as StepKey, this.normalizeDocType(docType), index);

        delete this.uploadedFiles[key];
        delete this.savedFileMeta[key];

        this.uploadedFiles = { ...this.uploadedFiles };
        this.savedFileMeta = { ...this.savedFileMeta };

        this.saveEducationStateToLocalStorage();
        this.cd.detectChanges();
      }
    });
  }
  hasLocalFile1(level: EducationType, docType: DocType, index?: number): boolean {
    // return !!this.uploadedFiles[this.buildDocKey(level, docType, index)];

    const key = this.buildKey(level as StepKey, this.normalizeDocType(docType), index);

    return !!this.uploadedFiles[key] || !!this.savedFileMeta[key];

  }
  hasLocalFile(level: any, docType: DocType, index?: number): boolean {
    const file = this.getStoredFileMeta(
      level as StepKey,
      docType,
      index
    );

    return !!file;
  }

  getLocalFileName1(level: EducationType, docType: DocType, index?: number): string {
    const f = this.uploadedFiles[this.buildDocKey(level, docType, index)] as File | null;
    return f?.name || '';
  }
  getLocalFileName11(level: any, docType: DocType, index?: number): string {
    const key = this.buildKey(
      level as StepKey,
      this.normalizeDocType(docType),
      index
    );

    const file: any = this.uploadedFiles[key];

    if (file instanceof File) {
      return file.name;
    }

    return this.savedFileMeta[key]?.fileName ||
      this.savedFileMeta[key]?.name ||
      file?.fileName ||
      file?.name ||
      '';
  }
  getLocalFileName(level: any, docType: DocType, index?: number): string {
    const file: any = this.getStoredFileMeta(
      level as StepKey,
      docType,
      index
    );

    if (!file) return '';

    if (file instanceof File) {
      return file.name;
    }

    return file.fileName || file.name || '';
  }
  private getStoredFileMeta(step: StepKey, docType: DocType, index?: number): any {
    const normalizedDoc = this.normalizeDocType(docType);

    const keyWithIndex = this.buildKey(step, normalizedDoc, index);
    const keyWithoutIndex = this.buildKey(step, normalizedDoc);

    return (
      this.uploadedFiles[keyWithIndex] ||
      this.savedFileMeta[keyWithIndex] ||
      this.uploadedFiles[keyWithoutIndex] ||
      this.savedFileMeta[keyWithoutIndex] ||
      null
    );
  }
  downloadLocal1(level: EducationType, docType: DocType, index?: number): void {
    const f = this.uploadedFiles[this.buildDocKey(level, docType, index)] as File | null;
    if (!f) return;

    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  downloadLocal2(level: any, docType: DocType, index?: number): void {
    const key = this.buildKey(level as StepKey, this.normalizeDocType(docType), index);

    const file = this.uploadedFiles[key];

    if (file instanceof File) {
      const url = URL.createObjectURL(file);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();

      URL.revokeObjectURL(url);
      return;
    }

    const url = this.getSavedFileUrl(key);
    const filename = this.savedFileMeta[key]?.fileName || 'document';

    if (!url) return;

    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(blobUrl);
      });
  }
  downloadLocal(level: any, docType: DocType, index?: number): void {
    const file: any = this.getStoredFileMeta(
      level as StepKey,
      docType,
      index
    );

    if (!file) return;

    if (file instanceof File) {
      const url = URL.createObjectURL(file);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'document';
      a.click();

      URL.revokeObjectURL(url);
      return;
    }

    const url =
      file.viewUrl ||
      file.fileUrl ||
      file.publicUrl ||
      '';

    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = file.fileName || file.name || 'document';
    a.click();
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

    if (!step || !form) return;

    const raw = form.getRawValue();

    if (!this.hasMeaningfulEducationValue(raw)) {
      return;
    }

    const normalized = {
      ...raw,
      institutename: this.normalizeDropdownValue(raw.institutename),
      location: this.normalizeDropdownValue(raw.location),
      passingyear: this.normalizeDropdownValue(raw.passingyear)
    };

    this.educationFormState[step] = normalized;

    this.stepperService.setEducationStepData(step, normalized);
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
        this.hasFileOrSavedMeta(step, 'ielts')
      );

    }

    //  Offer Letter
    if (step === 'offerletter') {

      return this.hasFileOrSavedMeta(step, 'offerletter');
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
      this.hasFileOrSavedMeta(step, doc.doc, doc.index)
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
        file: this.uploadedFiles[key] || this.savedFileMeta[key]
      }));
  }
  onOtherDocAdded(rowId: number) {
    const step = this.activeEducation as StepKey;
    const key = `${step}_other_${rowId}`;

    this.otherDocMap[key] = { title: '' };
    this.uploadedFiles[key] = null;
  }
  private ensureOtherDocEntry(step: StepKey, index: number, title: string = 'Other Document') {
    const key = this.buildKey(step, 'other', index);

    if (!this.otherDocMap[key]) {
      this.otherDocMap[key] = { title };
    }

    if (!(key in this.uploadedFiles) && this.savedFileMeta[key]) {
      this.uploadedFiles[key] = this.savedFileMeta[key] as any;
    }
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

  private saveEducationStateToLocalStorage1() {
    if (!this.applicantId) return;

    const forms: Record<string, any> = {};

    Object.keys(this.educationForms).forEach(step => {


      const form = this.educationForms[step];
      if (form) {
        forms[step] = form.getRawValue();
      }


    });

    const uploadedFileMeta: Record<string, any> = {

      ...this.savedFileMeta
    };



    Object.keys(this.uploadedFiles).forEach(key => {
      const file: any = this.uploadedFiles[key];

      if (file) {
        uploadedFileMeta[key] = {
          fileName: file.name,
          name: file.name,
          uploaded: true
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
  private saveEducationStateToLocalStorage() {
    if (!this.applicantId) return;

    const storageKey = this.getEducationStateKey();

    const oldSaved = localStorage.getItem(storageKey);
    const oldParsed = oldSaved ? JSON.parse(oldSaved) : {};

    const forms: Record<string, any> = {
      ...(oldParsed.educationFormState || {}),
      ...(this.educationFormState || {})
    };

    const activeStep = this.activeEducation as StepKey;

    if (activeStep && this.educationForms[activeStep]) {
      const form = this.educationForms[activeStep] as FormGroup;
      const raw = form.getRawValue();

      const hasValue = this.hasMeaningfulEducationValue(raw);

      // only save current form if it has real values
      if (hasValue) {
        forms[activeStep] = {
          ...forms[activeStep],
          ...raw,
          institutename: this.normalizeDropdownValue(raw.institutename),
          location: this.normalizeDropdownValue(raw.location),
          passingyear: this.normalizeDropdownValue(raw.passingyear)
        };

        this.educationFormState[activeStep] = forms[activeStep];
      }
    }

    const uploadedFileMeta: Record<string, any> = {
      ...(oldParsed.uploadedFileMeta || {}),
      ...(this.savedFileMeta || {})
    };

    Object.keys(this.uploadedFiles || {}).forEach(key => {
      const file: any = this.uploadedFiles[key];

      // important: only real File should update metadata
      if (file instanceof File) {
        uploadedFileMeta[key] = {
          ...(uploadedFileMeta[key] || {}),
          key,
          fileName: file.name,
          name: file.name,
          uploaded: true
        };
      }
    });

    const payload = {
      activeEducation: activeStep || oldParsed.activeEducation,
      educationFormState: forms,
      uploadedFileMeta,
      otherDocMap: {
        ...(oldParsed.otherDocMap || {}),
        ...(this.otherDocMap || {})
      },
      educationOrder: this.educationOrder?.length
        ? this.educationOrder
        : oldParsed.educationOrder
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
  }
  private hasMeaningfulEducationValue(raw: any): boolean {
    if (!raw) return false;

    const ignoredKeys = ['marksheet', 'lc', 'offerLetter'];

    return Object.keys(raw).some(key => {
      if (ignoredKeys.includes(key)) return false;

      const value = raw[key];

      return value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0);
    });
  }

  private restoreEducationStateFromLocalStorage() {
    if (!this.applicantId) return;
    const savedFileMeta: Record<string, any> = {};
    const saved = localStorage.getItem(this.getEducationStateKey());
    if (!saved) return;

    const parsed = JSON.parse(saved);

    // this.educationFormState = parsed.educationFormState || {};
    // this.otherDocMap = parsed.otherDocMap || {};

    this.educationFormState = {
      ...(this.educationFormState || {}),
      ...(parsed.educationFormState || {})
    };

    this.otherDocMap = {
      ...(this.otherDocMap || {}),
      ...(parsed.otherDocMap || {})
    };

    this.educationOrder = parsed.educationOrder || this.educationOrder;
    // this.activeEducation = parsed.activeEducation || this.activeEducation;
    this.activeEducation = this.activeEducation || parsed.activeEducation;

    Object.keys(this.educationFormState).forEach(step => {
      const form = this.educationForms[step];
      const savedValue = this.educationFormState[step];

      if (!form || !savedValue) return;

      form.patchValue({
        ...savedValue,
        institutename: this.normalizeDropdownValue(savedValue?.institutename),
        location: this.normalizeDropdownValue(savedValue?.location),
        passingyear: this.normalizeDropdownValue(savedValue?.passingyear),
      }, { emitEvent: false });


    });


    // if (parsed.uploadedFileMeta) {
    //   this.savedFileMeta = parsed.uploadedFileMeta || {};
    //   this.savedFileMeta = { ...this.savedFileMeta }

    // }
    if (parsed.uploadedFileMeta) {
      this.savedFileMeta = {
        ...(this.savedFileMeta || {}),
        ...(parsed.uploadedFileMeta || {})
      };
    }

    if (this.activeEducation) {

      setTimeout(() => {
        this.restoreFormState(this.activeEducation);
        this.cd.detectChanges();
      }, 200);

    }

    this.cd.detectChanges();
  }
  private async loadSavedEducationInfoFromApi(step: StepKey) {
    if (!this.applicationId || !this.applicantId || !step) return;

    const savedData = await this.getSavedSectionEducationInfo();

    if (!savedData) return;

    console.log('Saved education data from API:', savedData);

    this.patchSavedEducationData(step, savedData);

    const sectionKey = this.getCurrentEducationSectionKey();
    const localKey = `educationInfoData_${this.applicantId}_${sectionKey}`;
    localStorage.setItem(localKey, JSON.stringify(savedData));

    this.cd.detectChanges();

  }
  private patchSavedEducationData(step: StepKey, savedData: any) {
    const form = this.educationForms[step] as FormGroup;
    if (!form) return;

    const data = savedData?.jsonData || savedData;

    if (!data) return;

    if (step === 'ielts') {
      form.patchValue({
        score: data.score || ''
      }, { emitEvent: false });
    } else if (step === 'offerletter') {
      // no normal form fields except file display
    } else {
      form.patchValue({
        institutename: this.normalizeDropdownValue(data.institutename || data.instituteId),
        institutetitle: data.title || data.institutetitle || '',
        passingyear: this.normalizeDropdownValue(data.passingyear || data.yearOfPassing),
        per_cgpa: data.percentageCgpa || data.per_cgpa || '',
        location: this.normalizeDropdownValue(data.location || data.locationId),
        otherLocation: data.otherLocation || ''
      }, { emitEvent: false });
    }

    this.educationFormState[step] = form.getRawValue();

    if (data.otherDocMap) {
      this.otherDocMap = {
        ...this.otherDocMap,
        ...data.otherDocMap
      };
    }



    const uploadedDocuments =
      data.uploadedDocuments ||
      data.documents ||
      [];

    const uploadedFiles =
      data.uploadedFiles ||
      data.files ||
      [];

    const documentsToRestore =
      Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0
        ? uploadedDocuments
        : uploadedFiles;

    let marksheetCounter = 0;
    let otherCounter = 0;

    documentsToRestore.forEach((doc: any, index: number) => {
      const fallbackFile = uploadedFiles[index] || {};

      const type = doc.type || fallbackFile.type;
      if (!type) return;

      // let key = '';

      const key = this.getFileKeyFromApiType(
        step,
        type,
        marksheetCounter,
        otherCounter
      );

      if (type === 'MARKSHEET') {
        // key = this.buildKey(step, 'marksheet', marksheetCounter);
        marksheetCounter++;
      } else if (
        type === 'SCHOOL_LEAVING_CERT' ||
        type === 'LEAVING_CERTIFICATE'
      ) {
        // key = this.buildKey(step, 'lc');
      } else if (type === 'OTHER') {
        // key = this.buildKey(step, 'other', otherCounter);
        this.ensureOtherDocEntry(
          step,
          otherCounter,
          doc.title || fallbackFile.title || 'Other Document'
        );
        otherCounter++;

        this.otherDocMap[key] = {
          title: doc.title || fallbackFile.title || 'Other Document'
        };
      } else if (
        type === 'UPLOAD_CERTIFICATE' ||
        type === 'IELTS'
      ) {
        if (step === 'ielts') {
          // key = this.buildKey(step, 'ielts');
        } else if (step === 'offerletter') {
          // key = this.buildKey(step, 'offerletter');
        }
      } else if (type === 'OFFERLETTER') {
        // key = this.buildKey(step, 'offerletter');
      }

      if (!key) return;

      const meta = {
        key,
        name:
          doc.fileName ||
          fallbackFile.fileName ||
          doc.name ||
          fallbackFile.name ||
          '',
        fileName:
          doc.fileName ||
          fallbackFile.fileName ||
          doc.name ||
          fallbackFile.name ||
          '',
        title:
          doc.title ||
          fallbackFile.title ||
          type,
        type,
        viewUrl:
          doc.viewUrl ||
          fallbackFile.viewUrl ||
          '',
        fileUrl:
          doc.fileUrl ||
          fallbackFile.fileUrl ||
          '',
        publicUrl:
          doc.publicUrl ||
          fallbackFile.publicUrl ||
          '',
        objectKey:
          doc.objectKey ||
          fallbackFile.objectKey ||
          '',
        documentId:
          doc.documentId ||
          fallbackFile.documentId,
        uploaded: true
      };

      this.savedFileMeta[key] = meta;
      this.uploadedFiles[key] = meta as any;
    });

    this.savedFileMeta = { ...this.savedFileMeta };
    this.uploadedFiles = { ...this.uploadedFiles };
    this.otherDocMap = { ...this.otherDocMap };

    this.stepperService.setEducationStepData(step, form.getRawValue());

    this.cd.detectChanges();
  }
  private hasFileOrSavedMeta(step: StepKey, doc: DocType, index?: number): boolean {
    const key = this.buildKey(step, this.normalizeDocType(doc), index);

    return this.uploadedFiles[key] instanceof File || !!this.savedFileMeta[key];
  }
  private normalizeDropdownValue(value: any): any {
    if (Array.isArray(value)) {
      return value.length ? value[0] : '';
    }

    return value ?? '';
  }

  private getCurrentEducationSectionKey(): string {
    const step = this.activeEducation as StepKey;
    return this.educationSectionKeyMap[step] || 'BATCH_UPLOAD_10';
  }
  buildEducationInfoPayload() {

    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step] as FormGroup;

    if (!form) return {};

    const raw = form.getRawValue();
    const sectionKey = this.getCurrentEducationSectionKey();
    const filesMeta: any[] = [];

    Object.keys(this.uploadedFiles)
      .filter(key => key.startsWith(`${step}_`))
      .forEach(key => {
        const file: any = this.uploadedFiles[key];

        if (!file) return;

        filesMeta.push({
          key,
          type: this.getEducationDocumentType(key),
          fileName: file.name || file.fileName || '',
          title: this.otherDocMap[key]?.title || '',
          isUploadedFile: !(file instanceof File)
        });
      });

    return {

      applicationId: this.applicationId,
      applicantId: this.applicantId,
      sectionKey,
      step,
      category: 'EDUCATION',
      subcategory: this.stepToSubcategory[step],
      institutename: this.normalizeDropdownValue(raw.institutename),
      location: this.normalizeDropdownValue(raw.location),
      passingyear: this.normalizeDropdownValue(raw.passingyear),
      files: filesMeta,
      otherDocMap: this.otherDocMap
    };
  }
  private getFileKeyFromApiType(
    step: StepKey,
    type: string,
    marksheetCounter: number = 0,
    index: number = 0
  ): string {

    if (type === 'MARKSHEET') {
      return this.buildKey(step, 'marksheet', marksheetCounter);
    }

    if (
      type === 'SCHOOL_LEAVING_CERT' ||
      type === 'LEAVING_CERTIFICATE'
    ) {
      return this.buildKey(step, 'lc');
    }

    if (type === 'OTHER') {
      // return `${step}_other_${index + 1}`;
      return this.buildKey(step, 'other', index);
    }

    if (
      type === 'UPLOAD_CERTIFICATE' ||
      type === 'IELTS'
    ) {
      if (step === 'ielts') {
        return this.buildKey(step, 'ielts');
      }

      if (step === 'offerletter') {
        return this.buildKey(step, 'offerletter');
      }

      return this.buildKey(step, 'lc');
    }

    if (type === 'OFFERLETTER') {
      return this.buildKey(step, 'offerletter');
    }

    return '';
  }
  getEducationDocumentType(key: string): string {
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('marksheet')) {
      return 'MARKSHEET';
    }

    if (
      lowerKey.includes('school_leaving') ||
      lowerKey.includes('leaving') ||
      lowerKey.includes('schoolleaving')
    ) {
      return 'SCHOOL_LEAVING_CERT';
    }

    if (lowerKey.includes('ielts')) {
      return 'UPLOAD_CERTIFICATE';
    }

    if (lowerKey.includes('offerletter')) {
      return 'UPLOAD_CERTIFICATE';
    }


    if (lowerKey.includes('other')) {
      return 'OTHER';
    }

    return 'OTHER';
  }
  getSavedSectionEducationInfo(): Promise<any> {
    const sectionkey = this.getCurrentEducationSectionKey();

    return new Promise((resolve) => {
      this.formSvc.getSavedData(this.applicationId, this.applicantId, sectionkey).pipe()

        .subscribe({
          next: (res) => {

            console.log(res)
            if (res.status === "success") {
              resolve(res.data.data);

            }
            else {
              resolve(null);
            }
          }, error: () => resolve(null)
        });
    });
  }
  private async loadAllEducationDrafts(): Promise<void> {
    const savedDrafts = await this.getSavedEducationDrafts();

    if (savedDrafts?.length) {
      this.restoreEducationDraftData(savedDrafts);
    }
  }

  getSavedEducationDrafts1(): Promise<any[]> {
    const requests = this.educationDraftGetRequests.map(section => {
      return this.formSvc.getUploadedData(
        this.applicationId,
        this.applicantId,
        section.sectionKey,
        section.category,
        section.subcategory,
        section.documentType
      ).pipe(
        map((res: any) => {
          return {
            section: {
              ...section
            },
            data: res?.status === 'success'
              ? (res.data?.data || res.data || null)
              : null
          };
        }),
        catchError(err => {
          console.error(
            'Education draft get failed for:',
            section.sectionKey,
            section.subcategory,
            section.documentType,
            err
          );

          return of({
            section: {
              ...section
            },
            data: null
          });
        })
      );
    });

    return new Promise(resolve => {
      forkJoin(requests).subscribe({
        next: (responses: any[]) => {
          resolve(responses);
        },
        error: () => {
          resolve([]);
        }
      });
    });
  }
  getSavedEducationDrafts(): Promise<any[]> {
    const requests: any[] = [];

    const draftRequests = [
      {
        step: '10th',
        sectionKey: 'BATCH_UPLOAD_10',
        category: 'EDUCATION',
        subcategory: '_10TH',
        documentType: 'MARKSHEET'
      },
      {
        step: '12th',
        sectionKey: 'BATCH_UPLOAD_12',
        category: 'EDUCATION',
        subcategory: '_12TH',
        documentType: 'MARKSHEET'
      },
      {
        step: 'diploma10',
        sectionKey: 'BATCH_UPLOAD_DIPLOMA',
        category: 'EDUCATION',
        subcategory: 'DIPLOMA',
        documentType: 'MARKSHEET'
      },
      {
        step: 'ug',
        sectionKey: 'BATCH_UPLOAD_UNDERGRADUATE',
        category: 'EDUCATION',
        subcategory: 'UNDERGRADUATE',
        documentType: 'MARKSHEET'
      },
      {
        step: 'pg',
        sectionKey: 'BATCH_UPLOAD_POSTGRADUATE',
        category: 'EDUCATION',
        subcategory: 'POSTGRADUATE',
        documentType: 'MARKSHEET'
      },
      {
        step: 'ielts',
        sectionKey: 'BATCH_UPLOAD_IELTS_PTE',
        category: 'EDUCATION',
        subcategory: 'IELTS_PTE',
        documentType: 'UPLOAD_CERTIFICATE'
      },
      {
        step: 'offerletter',
        sectionKey: 'BATCH_UPLOAD_OFFER_LETTER',
        category: 'EDUCATION',
        subcategory: 'OFFER_LETTER',
        documentType: 'UPLOAD_CERTIFICATE'
      }
    ];

    draftRequests.forEach(section => {
      requests.push(
        this.formSvc.getUploadedData(
          this.applicationId,
          this.applicantId,
          section.sectionKey,
          section.category,
          section.subcategory,
          section.documentType
        ).pipe(
          map((res: any) => {
            return {
              section: { ...section },
              data: res?.status === 'success'
                ? (res.data?.data || res.data || null)
                : null
            };
          }),
          catchError(err => {
            console.error(
              'Education draft get failed for:',
              section.sectionKey,
              section.subcategory,
              section.documentType,
              err
            );

            return of({
              section: { ...section },
              data: null
            });
          })
        )
      );
    });

    return new Promise(resolve => {
      forkJoin(requests).subscribe({
        next: (responses: any[]) => resolve(responses),
        error: () => resolve([])
      });
    });
  }

  private restoreEducationDraftData(savedResponses: any[]): void {
    if (!savedResponses?.length) return;

    savedResponses.forEach(item => {
      const section = item?.section;
      const draft = item?.data;

      if (!section || !draft) return;

      let draftData =
        draft?.jsonData ||
        draft?.data ||
        draft;

      // If jsonData comes as string from API
      if (typeof draftData === 'string') {
        try {
          draftData = JSON.parse(draftData);
        } catch (e) {
          console.error('Invalid draft jsonData:', draftData);
          return;
        }
      }

      if (!draftData) return;

      const step = section.step || this.getStepFromSection(
        section.sectionKey,
        section.subcategory
      );

      if (!step) return;

      const form = this.educationForms[step] as FormGroup;

      // -----------------------------
      // 1. PATCH FORM DATA
      // -----------------------------
      if (form) {
        if (step === 'ielts') {
          form.patchValue({
            score:
              draftData.score ||
              draftData?.jsonData?.score ||
              ''
          }, { emitEvent: false });
        } else if (step !== 'offerletter') {
          form.patchValue({
            institutename: this.normalizeDropdownValue(
              draftData.instituteName ||
              draftData.institutename ||
              draftData.institutionId ||
              ''
            ),

            institutetitle:
              draftData.title ||
              draftData.institutetitle ||
              '',

            passingyear: this.normalizeDropdownValue(
              draftData.yearOfPassing ||
              draftData.passingyear ||
              ''
            ),

            per_cgpa:
              draftData.percentageCgpa ||
              draftData.per_cgpa ||
              '',

            location: this.normalizeDropdownValue(
              draftData.locationName ||
              draftData.locationId ||
              draftData.location ||
              ''
            ),

            otherLocation:
              draftData.otherLocation ||
              ''
          }, { emitEvent: false });
        }

        this.educationFormState[step] = form.getRawValue();

        this.stepperService.setEducationStepData(
          step,
          this.educationFormState[step]
        );
      }

      // -----------------------------
      // 2. PATCH FILE DATA
      // -----------------------------
      const uploadedDocuments =
        draftData.uploadedDocuments ||
        draftData.documents ||
        [];

      const uploadedFiles =
        draftData.uploadedFiles ||
        draftData.files ||
        [];

      // uploadedDocuments has actual viewUrl, so use it first
      const documentsToRestore =
        Array.isArray(uploadedDocuments) && uploadedDocuments.length > 0
          ? uploadedDocuments
          : uploadedFiles;

      let marksheetCounter = 0;
      let otherCounter = 0;

      documentsToRestore.forEach((doc: any, index: number) => {
        const fallbackFile = uploadedFiles[index] || {};

        const type =
          doc.type ||
          fallbackFile.type ||
          section.documentType ||
          draftData.documentType ||
          draftData.type;

        if (!type) return;

        // let key = '';

        const key = this.getFileKeyFromApiType(
          step,
          type,
          marksheetCounter,
          otherCounter
        );
        if (!key) return;
        if (type === 'MARKSHEET') {
          // key = this.buildKey(step, 'marksheet', marksheetCounter);
          marksheetCounter++;
        } else if (
          type === 'SCHOOL_LEAVING_CERT' ||
          type === 'LEAVING_CERTIFICATE'
        ) {
          // key = this.buildKey(step, 'lc');
        } else if (type === 'OTHER') {
          // key = `${step}_other_${otherCounter}`;
          // key = this.buildKey(step, 'other', otherCounter);

          this.ensureOtherDocEntry(
            step,
            otherCounter,
            doc.title || fallbackFile.title || 'Other Document'
          );

          this.otherDocMap[key] = {
            title:
              doc.title ||
              fallbackFile.title ||
              'Other Document'
          };
          otherCounter++;
        }
        else if (
          type === 'UPLOAD_CERTIFICATE' ||
          type === 'IELTS'
        ) {
          if (step === 'ielts') {
            // key = this.buildKey(step, 'ielts');
          } else if (step === 'offerletter') {
            // key = this.buildKey(step, 'offerletter');
          }
        } else if (type === 'OFFERLETTER') {
          // key = this.buildKey(step, 'offerletter');
        }

        if (!key) return;

        const meta = {
          key,

          name:
            doc.fileName ||
            fallbackFile.fileName ||
            doc.name ||
            fallbackFile.name ||
            '',

          fileName:
            doc.fileName ||
            fallbackFile.fileName ||
            doc.name ||
            fallbackFile.name ||
            '',

          title:
            doc.title ||
            fallbackFile.title ||
            type,

          type,

          viewUrl:
            doc.viewUrl ||
            fallbackFile.viewUrl ||
            '',

          fileUrl:
            doc.fileUrl ||
            fallbackFile.fileUrl ||
            '',

          publicUrl:
            doc.publicUrl ||
            fallbackFile.publicUrl ||
            '',

          objectKey:
            doc.objectKey ||
            fallbackFile.objectKey ||
            '',

          documentId:
            doc.documentId ||
            fallbackFile.documentId,

          uploaded: true
        };

        this.savedFileMeta[key] = meta;

        // Optional but useful if child upload component only checks uploadedFiles
        this.uploadedFiles[key] = meta as any;
      });
    });

    // -----------------------------
    // 3. FINAL REFRESH
    // -----------------------------
    this.savedFileMeta = { ...this.savedFileMeta };
    this.otherDocMap = { ...this.otherDocMap };

    this.saveEducationStateToLocalStorage();

    Object.keys(this.educationFormState).forEach(step => {
      this.stepperService.setEducationStepData(
        step,
        this.educationFormState[step]
      );
    });

    if (this.activeEducation) {
      this.restoreFormState(this.activeEducation);
    }


    this.cd.detectChanges();
    console.log('savedFileMeta after restore:', this.savedFileMeta);
  }
  private getExistingMarksheetCount(step: StepKey): number {
    return Object.keys(this.savedFileMeta || {})
      .filter(key => key.startsWith(`${step}_marksheet_`))
      .length;
  }

  private getStepFromSection(sectionKey: string, subcategory?: string): StepKey | null {
    if (sectionKey === 'BATCH_UPLOAD_10') return '10th';
    if (sectionKey === 'BATCH_UPLOAD_12') {
      if (subcategory === 'OTHER_AFTER_12') return 'others12';
      return '12th';
    }

    if (sectionKey === 'BATCH_UPLOAD_DIPLOMA') {
      if (subcategory === 'OTHER_AFTER_DIPLOMA') return 'othersdiploma';

      // choose based on active flow/order if both exist
      if (this.educationOrder.includes('diploma10')) return 'diploma10';
      return 'diploma12';
    }

    if (sectionKey === 'BATCH_UPLOAD_UNDERGRADUATE') return 'ug';
    if (sectionKey === 'BATCH_UPLOAD_POSTGRADUATE') return 'pg';
    if (sectionKey === 'BATCH_UPLOAD_IELTS_PTE') return 'ielts';
    if (sectionKey === 'BATCH_UPLOAD_OFFER_LETTER') return 'offerletter';

    return null;
  }
  saveExit() {
  this.msgBox.open({
      title: 'Are you sure you want to exit?',
      message: ``,
      showCancel: true,
      onOk: () => {

    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step] as FormGroup;

    if (!form) return;

    this.saveCurrentFormState();
    this.saveEducationStateToLocalStorage();

    const sectionKey = this.getCurrentEducationSectionKey()
    const payload = this.buildEducationInfoPayload();

    const localKey = `educationInfoData_${this.applicantId}_${sectionKey}`;
    localStorage.setItem(localKey, JSON.stringify(payload));

    const fd = this.buildEducationSaveExitFormData(sectionKey);
    // fd.append('sectionKey', sectionKey);

    this.formSvc.saveandExit(fd).subscribe({
      next: (res: any) => {

        console.log('Education save and exit success:', res);

        if (res?.data) {
          this.restoreEducationDraftData([
            {
              section: {
                sectionKey,
                category: 'EDUCATION',
                subcategory: this.stepToSubcategory[step]
              },
              data: res.data
            }
          ]);
        }

        this.hasUnsavedChanges = false;

      },
      error: (err: any) => {
        console.error('Education save and exit failed:', err);
        alert('Failed to save education details.');
      }
    });

 this.router.navigate(['/admin/losoperation']);
     }
    });
  }

  private buildEducationSaveExitFormData(sectionKey: string): FormData {
    const step = this.activeEducation as StepKey;
    const form = this.educationForms[step] as FormGroup;
    const fd = new FormData();

    // const sectionKey = this.getCurrentEducationSectionKey();
    const subcategory = this.stepToSubcategory[step];

    // fd.append('action', 'auto-save');
    fd.append('sectionKey', sectionKey);
    fd.append('applicationId', this.applicationId);
    fd.append('applicantId', this.applicantId);
    fd.append('category', 'EDUCATION');
    fd.append('subcategory', subcategory);

    if (step === 'ielts') {
      fd.append('score', form.get('score')?.value || '');

      const file = this.getFile(step, 'ielts');
      if (file instanceof File) {
        fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
        fd.append('files[0].file', file);
      }

      return fd;
    }

    if (step === 'offerletter') {
      const file = this.getFile(step, 'offerletter');

      if (file instanceof File) {
        fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
        fd.append('files[0].file', file);
      }

      return fd;
    }

    fd.append('instituteId', form.get('institutename')?.value || '');
    fd.append('title', form.get('institutetitle')?.value || '');
    fd.append('yearOfPassing', form.get('passingyear')?.value || '');
    fd.append('percentageCgpa', form.get('per_cgpa')?.value || '');
    fd.append('locationId', form.get('location')?.value || '');
    fd.append('otherLocation', form.get('otherLocation')?.value || '');

    let fileIndex = 0;

    const reqDocs = this.requiredDocs(step);

    reqDocs.forEach(r => {
      const file = this.getFile(step, r.doc, r.index);

      if (file instanceof File) {
        fd.append(`files[${fileIndex}].type`, r.apiType);
        fd.append(`files[${fileIndex}].file`, file);
        fileIndex++;
      }
    });

    Object.keys(this.uploadedFiles)
      .filter(key => key.startsWith(`${step}_other_`))
      .forEach(key => {
        const file = this.uploadedFiles[key];

        if (file instanceof File) {
          fd.append(`files[${fileIndex}].type`, 'OTHER');
          fd.append(`files[${fileIndex}].title`, this.otherDocMap[key]?.title || 'Other Document');
          fd.append(`files[${fileIndex}].file`, file);
          fileIndex++;
        }
      });

    return fd;
  }
  async next() {
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

      const key = this.buildKey(step, 'ielts');
      const file = this.uploadedFiles[key];



      if (!score || !this.hasFileOrSavedMeta(step, 'ielts')) {
        alert('Please enter score and upload IELTS certificate.');
        return;
      }


      fd.append('score', score);
      if (file instanceof File) {
        fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
        fd.append('files[0].file', file);

      }else if (this.savedFileMeta[key]) {
        console.log('Already saved file, skipping upload:', key);

        const meta = this.savedFileMeta[key];


        if (meta.viewUrl) {
          const fileFromUrl = await this.urlToFile(
            meta.viewUrl,
            meta.fileName || 'file.jpg'
          );
          fd.append(`files[0].type`, meta.type );
          fd.append(`files[0].file`, fileFromUrl); 
          
        } else {
          console.warn('No viewUrl to convert file:', key);
        }

      }


    }

    else if (step === 'offerletter') {
      const key = this.buildKey(step, 'offerletter');
      const file = this.uploadedFiles[key];
      
      if (!this.hasFileOrSavedMeta(step, 'offerletter')) {
        alert('Please upload offer letter.');
        return;
      }

      if (file instanceof File) {
        fd.append('files[0].type', 'UPLOAD_CERTIFICATE');
        fd.append('files[0].file', file);
      } else if (this.savedFileMeta[key]) {
        console.log('Already saved file, skipping upload:', key);

        const meta = this.savedFileMeta[key];


        if (meta.viewUrl) {
          const fileFromUrl = await this.urlToFile(
            meta.viewUrl,
            meta.fileName || 'file.jpg'
          );
          fd.append(`files[0].type`, meta.type );
          fd.append(`files[0].file`, fileFromUrl); 
         
        } else {
          console.warn('No viewUrl to convert file:', key);
        }

      }
    }
    else {
      const reqDocs = this.requiredDocs(step);
      console.log('reqdoc-', reqDocs);


      if (step !== 'pg') {
        const missingFiles = reqDocs.filter(r => !this.getFile(step, r.doc, r.index));
        if (missingFiles.length > 0) {
          alert('Please upload all required documents.');
          return;
        }
      }



      let fileIndex = 0;

      reqDocs.forEach(async r => {
        const key = this.buildKey(step, r.doc as DocType, r.index);
        const file = this.uploadedFiles[key];

        if (file instanceof File) {
          fd.append(`files[${fileIndex}].type`, r.apiType);
          fd.append(`files[${fileIndex}].file`, file);
          fileIndex++;
        } else if (this.savedFileMeta[key]) {
          console.log('Already saved file, skipping upload:', key);

          const meta = this.savedFileMeta[key];

          // fd.append(`files[${fileIndex}].type`, meta.type || r.apiType);
          // fd.append(`files[${fileIndex}].file`, meta.fileName);
          // fileIndex++;

          if (meta.viewUrl) {
            const fileFromUrl = await this.urlToFile(
              meta.viewUrl,
              meta.fileName || 'file.jpg'
            );

            fd.append(`files[${fileIndex}].type`, meta.type || r.apiType);
            fd.append(`files[${fileIndex}].file`, fileFromUrl); // ✅ correct

            fileIndex++;
          } else {
            console.warn('No viewUrl to convert file:', key);
          }

        }
      });


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


          if (file instanceof File) {
            fd.append(`files[${fileIndex}].type`, 'MARKSHEET');
            fd.append(`files[${fileIndex}].file`, file);

            fileIndex++;
          }
          else if (this.savedFileMeta[key]) {
            console.log('Already saved file, skipping upload:', key);
          } else {
            console.warn('Missing required file:', key);
          }

        });


      Object.keys(this.uploadedFiles)
        .filter(key => key.startsWith(`${step}_other_`))
      // .forEach(key => {
      //   const file = this.uploadedFiles[key];
      //   if (!file) return;

      //   const meta = this.otherDocMap[key];



      //   fd.append(`files[${fileIndex}].type`, 'OTHER');
      //   fd.append(
      //     `files[${fileIndex}].title`,
      //     meta?.title || 'Other Document'
      //   );
      //   fd.append(`files[${fileIndex}].file`, file);

      //   fileIndex++;
      // });

      for (const key of Object.keys(this.uploadedFiles)
        .filter(key => key.startsWith(`${step}_other_`))) {

        const file = this.uploadedFiles[key];
        if (!file) continue;

        const meta = this.otherDocMap[key];

        if (file instanceof File) {
          fd.append(`files[${fileIndex}].type`, 'OTHER');
          fd.append(`files[${fileIndex}].title`, meta?.title || 'Other Document');
          fd.append(`files[${fileIndex}].file`, file);
        } else if (this.savedFileMeta[key]?.viewUrl) {
          const saved = this.savedFileMeta[key];

          const fileFromUrl = await this.urlToFile(
            saved.viewUrl,
            saved.fileName
          );

          fd.append(`files[${fileIndex}].type`, 'OTHER');
          fd.append(`files[${fileIndex}].title`, meta?.title || 'Other Document');
          fd.append(`files[${fileIndex}].file`, fileFromUrl);
        }

        fileIndex++;
      }


      fd.append('instituteId', form.get('institutename')?.value);
      fd.append('otherInstituteName', form.get('institutetitle')?.value);
      fd.append('yearOfPassing', form.get('passingyear')?.value);
      fd.append('percentageCgpa', form.get('per_cgpa')?.value);
      fd.append('locationId', form.get('location')?.value);
      fd.append('otherLocationName', form.get('otherLocation')?.value);

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
