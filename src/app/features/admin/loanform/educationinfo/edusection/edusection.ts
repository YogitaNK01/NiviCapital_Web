import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Checkbox } from '../../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../../systemdesign/inputfield/inputfield';
import { Radiobuttons } from '../../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../../systemdesign/uploadbtn/uploadbtn';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';
import { ActivatedRoute } from '@angular/router';
import { Loanformservice } from '../../../../../core/service/loanformservice';
import { Msgboxservice } from '../../../../../core/service/msgboxservice';
import { Main } from '../../../../../core/service/main';

interface Document {
  title: string;
  name?: string;
  url?: string;
  fileUrl?: string;
  fileName?: String;
  type?: string;
  documentId?: string;
  viewUrl?: string;
  slotIndex?: number;
}


interface OptionItem {
  label: string;
  value: string;
  code?: string;
}
type EducationType =
  | '_10TH'
  | '_12TH'
  | 'DIPLOMA'
  | 'UNDERGRADUATE'
  | 'POSTGRADUATE'
  | 'IELTS_PTE'
  | 'OFFER_LETTER'
  | 'OTHER'
  | 'OTHER_AFTER_DIPLOMA'
  | 'OTHER_AFTER_12';

type DocType = 'marksheet' | 'lc' | 'offer' | 'ielts' | 'other';


export type SectionFileEvent = {
  step: any;                   // '10th' | '12th' | ...
  control: 'marksheet' | 'lc' | 'other';
  index?: number;
  file: File | null;
  gropudata?: any
};

@Component({
  selector: 'app-edusection',
  imports: [CommonModule, Buttons, Dropdown, ReactiveFormsModule, Uploadbtn, Inputfield],
  standalone: true,
  templateUrl: './edusection.html',
  styleUrl: './edusection.scss'
})
export class Edusection {
  applicantId: string = '';
  applicationId: string = '';


  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };


  @Input() group!: FormGroup;
  @Input() title!: string;
  @Input() isHigher: boolean = false;

  @Input() sectionType!: 'school' | 'diploma' | 'bachelors' | 'postgrad' | 'others';
  marksheetCount = 1;
  showLC = false;
  marksheetlabel = 'Marksheet'
  educationType!: EducationType;

  //dropdowns
  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  passingyear: string = 'Year of Passing';
  selectpassingyr: DropdownOption[] = [];


  per_cgpa: string = 'Percentage / CGPA ';
  selectpercentage: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]




  otherDocuments: {
    id: number;
    title: string;
    file: File | null;
  }[] = [];

  @ViewChild(Uploadbtn) uploadComponent!: Uploadbtn;
  @Output() fileSelected = new EventEmitter<SectionFileEvent>();

  @Input() uploadedFiles: Record<string, File | null> = {};

  @Input() stepKey!: '10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg' | 'others' | 'others12' | 'othersdiploma';

  handleresponse: any;

  requiredDocs = ['salary1', 'salary2', 'salary3', 'Form16', 'oneyearbankstatement', 'ay1', 'ay2', 'ay3'];   // only required ones
  requiredBusinessDocs = ['businessITR1', 'businessITR2', 'businessITR3', 'businessGST', 'businessBankstatement'];   // only required ones

  optionalDocs = ['other'];
  uploadedrespfiles: any[] = [];
  allDocuments: any[] = [];
  documentMap: { [key: string]: any } = {};

  imgUrl: string = '';
  imgFileName: string = '';

  otherbusinessdoc: boolean = false;
  otherdoc: boolean = false;
  private slotCounter = 0;

  seleactInstitute: OptionItem[] = []
  selectedInstituteID = '';
  selectedInstituteLabel = '';

  selectlocation: OptionItem[] = []
  selectedLocationID = '';
  selectedLocationLabel = '';

  isOtherEducation = false;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private route: ActivatedRoute,
    public main: Main, private msgBox: Msgboxservice, public loanformservice: Loanformservice) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;


      if (params['qualificationId']) {
        // this.activeQualificationId = params['qualificationId'];
      }


    });
    this.getInstituteName();
    this.cityNames();
    this.selectpassingyr = this.buildYearOptions(20);


    if (this.sectionType === 'school' && this.title.toLowerCase().includes('12')) {
      this.marksheetCount = 1;
      this.educationType = '_12TH';
    }
    else if (this.sectionType === 'school') {
      this.marksheetCount = 1;
      this.educationType = '_10TH';
    }


    if (this.sectionType === 'diploma') {
      this.marksheetCount = 3;
      // this.showLC = false;
      this.educationType = 'DIPLOMA';
    }

    if (this.sectionType === 'bachelors') {
      this.marksheetCount = 4;
      // this.showLC = false;
      this.educationType = 'UNDERGRADUATE';
    }

    if (this.sectionType === 'postgrad') {
      this.marksheetCount = 2;
      // this.showLC = false;
      this.educationType = 'POSTGRADUATE';
    }
    if (this.sectionType === 'others' && this.title.toLowerCase().includes('after 12th')) {
      this.marksheetCount = 1;
      // this.showLC = false;
      this.educationType = 'OTHER_AFTER_12';
    }
    if (this.sectionType === 'others' && this.title.toLowerCase().includes('diploma')) {
      this.marksheetCount = 1;
      // this.showLC = false;
      this.educationType = 'OTHER_AFTER_DIPLOMA';
    }

    this.group = this.fb.group({

    //   institutename: ['', Validators.required],
    //   passingyear: ['', Validators.required],
      per_cgpa: ['', [Validators.required, this.percentageOrCgpaValidator()]],
    //   location: ['', Validators.required],
    //   marksheet: ['', Validators.required],
    //   lc: ['', Validators.required],

    })

  }

  get level(): EducationType {
    return this.getLevelFromTitle(this.title);
  }
  get isSchoolLevel(): boolean {
    return this.educationType === '_10TH' || this.educationType === '_12TH' || this.educationType === 'OTHER_AFTER_12' || this.educationType === 'OTHER_AFTER_DIPLOMA';
  }

  get isHigherEducation(): boolean {
    return this.educationType === 'DIPLOMA' || this.educationType === 'UNDERGRADUATE' || this.educationType === 'POSTGRADUATE';
  }

percentageOrCgpaValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw === null || raw === '') return null;

    const value = raw.toString();
    const num = Number(value);

    if (isNaN(num)) {
      return { invalidNumber: true };
    }

    const isPercentage =
      num >= 35 &&
      num <= 100 &&
      /^\d+(\.\d{1,2})?$/.test(value);

    const isCgpa =
      num >= 4 &&
      num <= 10 &&
      /^\d+(\.\d{1})?$/.test(value);

    return isPercentage || isCgpa ? null : { invalidPerCgpa: true };
  };
}

  percentageOrCgpaValidator1() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === '') return null;

      const num = Number(value);
      if (isNaN(num)) return { invalidNumber: true };


      const isPercentage =
        num >= 35 &&
        num <= 100 &&
        /^\d+(\.\d{1,2})?$/.test(value);


      const isCgpa =
        num >= 4 &&
        num <= 10 &&
        /^\d+(\.\d{1})?$/.test(value);

      return isPercentage || isCgpa ? null : { invalidPerCgpa: true };
    };
  }

  private buildYearOptions(backYears: number): DropdownOption[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - backYears;

    const years: DropdownOption[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push({ label: String(y), value: String(y), icon: '' });
    }
    return years;
  }

  getInstituteName() {
    this.loanformservice.getInstitutes().subscribe((res: any) => {
      const list = res.data ?? res;

      this.seleactInstitute = list.map((s: any) => ({
        value: s.id,
        label: s.instituteName,

      }));
    });
  }

  SelectedInstitute(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.seleactInstitute.filter(s =>
      ids.includes(s.value)
    );

    this.selectedInstituteLabel = selected.map(s => s.label).join(', ');
    this.selectedInstituteID = selected.map(s => s.value).join(', ');


    this.isOtherEducation = selected.some(
      s => s.label.trim().toLowerCase() === 'other'
    )

    this.group.get('institutename')?.setValue(this.selectedInstituteID);

  }


  cityNames() {
    this.loanformservice.getAllCities().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectlocation = list.map((s: any) => ({
        value: s.id,
        label: s.name,

      }));
    });
  }
  SelectedCity(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.selectlocation.filter(s =>
      ids.includes(s.value)
    );

    this.selectedLocationLabel = selected.map(s => s.label).join(', ');
    this.selectedInstituteID = selected.map(s => s.value).join(', ');

    this.group.get('location')?.setValue(this.selectedLocationLabel);

  }

  getLevelFromTitle(title: string): EducationType {
    const t = (title || '').toLowerCase();

    if (t.includes('10th')) return '_10TH';
    if (t.includes('12th')) return '_12TH';
    if (t.includes('diploma') && t.includes('10')) return 'DIPLOMA';
    if (t.includes('diploma') && t.includes('12')) return 'UNDERGRADUATE';
    if (t.includes('undergraduate')) return 'UNDERGRADUATE';
    if (t.includes('postgraduate')) return 'POSTGRADUATE';

    return 'OTHER';
  }
  // onFileChange(result: UploadResult, key: string , type:'marksheet'| 'lc'): void {
  //   if (!result?.file) {
  //     this.uploadedFiles[key] = null;
  //     return;
  //   }

  //   this.uploadedFiles[key] = result.file;
  //   this.uploadedFiles = { ...this.uploadedFiles };
  // }



  hasLocal(doc: 'marksheet' | 'lc' | 'other', index?: number): boolean {
    return !!this.uploadedFiles?.[this.buildKey(doc, index)];
  }


  getLocalName(doc: 'marksheet' | 'lc' | 'other', index?: number): string {
    return this.uploadedFiles?.[this.buildKey(doc, index)]?.name ?? '';
  }


  buildKey(doc: DocType, index?: number): string {
    return index
      ? `${this.stepKey}_${doc}_${index}`
      : `${this.stepKey}_${doc}`;
  }
  buildDocKey(level: EducationType, docType: DocType, index?: number): string {
    return index ? `${level}_${docType}_${index}` : `${level}_${docType}`;
  }



  onFileChange(result: UploadResult, level: EducationType, docType: 'marksheet' | 'lc' | 'other', index?: number): void {

    if (!this.uploadedFiles) {
      this.uploadedFiles = {};
    }

    const key = this.buildKey(docType, index);

    if (!result?.file) {
      this.uploadedFiles[key] = null;
      return;
    }

    this.uploadedFiles[key] = result.file;
    this.uploadedFiles = { ...this.uploadedFiles };
    console.log("this.group.value----------------", this.group.value);

    this.fileSelected.emit({
      step: this.stepKey,
      control: docType,
      index: index,
      file: result.file ?? null,
      gropudata: { ...this.group.value }
    });
  }

  getDocTypeEnum(): DocType {
    return 'lc';
  }


  getLocalFileUrl(level: EducationType, docType: DocType, index?: number): string {
    const key = this.buildDocKey(level, docType, index);
    const f = this.uploadedFiles[key] as File | null;
    return f ? URL.createObjectURL(f) : '';
  }



  hasLocalFile1(level: EducationType, docType: DocType, index?: number): boolean {
    return !!this.uploadedFiles[this.buildDocKey(level, docType, index)];
  }

  hasLocalFile(level: EducationType, docType: DocType, index?: number): boolean {
    if (!this.uploadedFiles) return false;
    return !!this.uploadedFiles[this.buildDocKey(level, docType, index)];
  }


  getLocalFileName(level: EducationType, docType: DocType, index?: number): string {
    const f = this.uploadedFiles[this.buildDocKey(level, docType, index)] as File | null;
    return f?.name || '';
  }

  viewImage(url: string): void {
    window.open(url, '_blank');
  }

  viewLocalFile(doc: DocType, index?: number): void {
    const key = this.buildKey(doc, index);
    const file = this.uploadedFiles[key];
    if (!file) return;

    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  }
  downloadLocalFile(doc: DocType, index?: number): void {
    const key = this.buildKey(doc, index);
    const file = this.uploadedFiles[key];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();

    URL.revokeObjectURL(url);
  }

  removeLocalFile(doc: DocType, index?: number): void {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {

        const key = this.buildKey(doc, index);

        this.uploadedFiles[key] = null;
        this.uploadedFiles = { ...this.uploadedFiles };
      }
    })
  }
  // ----------------------------------------------------------------------------
  onUploadStarted(
    result: UploadResult, key: string,
    subcategory: '_10TH' | '_12TH' | 'DIPLOMA' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'IELTS_PTE' | 'OFFER_LETTER' | 'OTHER',
    type: 'MARKSHEET' | 'SCHOOL_LEAVING_CERT' | 'DEGREE_CERTIFICATE' | 'UPLOAD_CERTIFICATE' | 'OTHER',
  ) {

    if (!result.file) return;


    this.uploadedFiles[key] = result.file;

    const fd = new FormData();
    fd.append('category', 'EDUCATION');
    fd.append('subcategory', subcategory);
    fd.append('applicantId', this.applicantId);
    fd.append('files[0].title', key);
    fd.append('files[0].type', type);
    fd.append('files[0].file', result.file);

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {


        // this.fileresponse.emit(res)
        this.handleresponse = res
        this.uploadedrespfiles.push(res.data)
        this.uploadedFiles = { ...  this.uploadedFiles }





        this.getAllDocuments();
      },
      error: (err) => {

        const errorMsg = err.error?.message || 'Failed to upload file';
        this.uploadComponent.setErrorFromApi(errorMsg);
      }
    });
  }

  getAllDocuments() {
    const docs: Document[] = [];

    this.uploadedrespfiles.forEach(item => {
      if (item.uploadedDocuments?.length > 0) {
        docs.push(...item.uploadedDocuments);
      }
    });



    // Use type as key, fallback to filename
    this.documentMap = docs.reduce((map, doc) => {
      const key = doc.type || doc.fileName?.trim() || doc.documentId! || doc.title!;
      if (key) {
        map[key] = doc;
      }
      return map;
    }, {} as { [key: string]: Document });

    this.allDocuments = docs;
    // this.rebuildDocumentMap();
  }

  getDocumentName(key: any): any {
    const doc = this.getDocumentByKey(key);
    return doc?.fileName || doc?.title || 'No file uploaded';  // Use fileName!
  }


  getDocumentUrl(key: string): string {
    const doc = this.getDocumentByKey(key);
    return doc?.viewUrl || '';  // Use viewUrl!
  }

  get allRequiredFilesUploaded(): boolean {
    if (this.loanformservice.issalaried) {
      return this.requiredDocs.every(key => !!this.getDocumentByKey(key));
    } else {
      return this.requiredBusinessDocs.every(key => !!this.getDocumentByKey(key));
    }
    // return this.requiredDocs.every(key => !!this.getDocumentByKey(key));
  }


  getDocumentByKeyold(key: string): Document | null {
    if (!this.allDocuments?.length) return null;

    // let doc = this.allDocuments.find(doc => doc.title === key);
    let doc = this.allDocuments.find(doc => doc.type === key);

    if (!doc) {
      doc = this.allDocuments.find(doc =>
        doc.type?.includes(key) ||
        doc.title?.includes(key) ||
        doc.fileName?.includes(key)
      );
    }

    return doc || null;
  }

  getDocumentByKey(key: string): Document | null {
    if (!key || !key.trim() || !this.allDocuments?.length) return null;

    let doc = this.allDocuments.find(d => d.type === key || d.title === key);

    if (!doc) {
      doc = this.allDocuments.find(d =>
        (d.type && d.type.includes(key)) ||
        (d.title && d.title.includes(key)) ||
        (d.fileName && d.fileName.includes(key))
      );
    }

    return doc || null;
  }


  hasDocument(documentKey: string): boolean {
    return !!this.getDocumentByKey(documentKey);
  }


  downloadImage(url: string, filename: string): void {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();

        window.URL.revokeObjectURL(blobUrl);

      });

  }

  deleteImage(key: string): void {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {
        const docToDelete = this.getDocumentByKey(key);
        if (!docToDelete) return;


        this.allDocuments = this.allDocuments.filter(doc =>
          doc.documentId !== docToDelete.documentId
        );


        this.rebuildDocumentMap();

        this.uploadedrespfiles = this.uploadedrespfiles.filter(item => {
          if (item.uploadedDocuments) {
            item.uploadedDocuments = item.uploadedDocuments.filter((doc: { documentId: string | undefined; }) =>
              doc.documentId !== docToDelete.documentId
            );
            return item.uploadedDocuments.length > 0;
          }
          return true;
        });
        this.cd.detectChanges();

        // localStorage.setItem(
        //   'income_uploaded_docs',
        //   JSON.stringify(this.uploadedrespfiles)
        // );

      }
    });
  }
  private rebuildDocumentMap(): void {
    const docs = this.allDocuments || [];
    this.documentMap = docs.reduce((map, doc) => {
      const key = doc.type || doc.fileName?.trim() || doc.documentId! || doc.title!;
      if (key) {
        map[key] = doc;
      }
      return map;
    }, {} as { [key: string]: Document });
  }

  addotherdocuments() {

    // const id = ++this.slotCounter;
    this.otherDocuments.push({

      id: ++this.slotCounter,
      title: '',
      file: null


    });

  }
  onOtherFileChange(result: UploadResult, doc: any) {
    if (!result?.file) return;

    doc.file = result.file;

    const key = `${this.stepKey}_other_${doc.id}`;
    this.uploadedFiles[key] = result.file;
    this.uploadedFiles = { ...this.uploadedFiles };

    this.group.markAsDirty();

    this.fileSelected.emit({
      step: this.stepKey,
      control: 'other',
      index: doc.id,
      file: result.file,
      gropudata: {
        title: doc.title
      }
    });
  }


  removeOther(doc: any) {
    const key = `others_${doc.id}`;
    delete this.uploadedFiles[key];

    this.otherDocuments = this.otherDocuments.filter(d => d.id !== doc.id);
    this.uploadedFiles = { ...this.uploadedFiles };
  }

  viewOther(doc: any) {
    window.open(URL.createObjectURL(doc.file), '_blank');
  }

  downloadOther(doc: any) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  removeOtherDocument(doc: { id: number; title: string; file: File | null }): void {
    this.msgBox.open({

      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,


      onOk: () => {
        const key = `${this.stepKey}_other_${doc.id}`;
        delete this.uploadedFiles[key];
        this.uploadedFiles = { ...this.uploadedFiles };

        this.otherDocuments = this.otherDocuments.filter(d => d.id !== doc.id);

        this.group.markAsDirty();

        this.fileSelected.emit({
          step: this.stepKey,
          control: 'other',
          index: doc.id,
          file: null,
          gropudata: { title: doc.title }
        });

        this.cd.detectChanges();
      }
    });
  }



  back() {

    this.stepperService.previous();
  }
  next() {

  }
}
