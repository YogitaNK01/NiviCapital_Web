import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output, output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { ActivatedRoute } from '@angular/router';
import { Main } from '../../../../core/service/main';


interface Document {
  title: string;
  name?: string;
  url?: string;
  fileUrl?: string;
  fileName?: String;
  type?: string;
  documentId?: string;
  viewUrl?: string;
}
@Component({
  selector: 'app-incomeinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, FormsModule, Inputfield],
  standalone: true,
  templateUrl: './incomeinfo.html',
  styleUrl: './incomeinfo.scss'
})
export class Incomeinfo {
  // uploadedFiles = {};
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
  applicantId: string = '';
  applicationId: string = '';
  incomeForm!: FormGroup

  isbussiness: boolean = false

  @ViewChild(Uploadbtn) uploadComponent!: Uploadbtn;
  @Output() fileresponse = new EventEmitter<any>();
  handleresponse: any;

  requiredDocs = ['salary1', 'salary2', 'salary3', 'Form16', 'oneyearbankstatement', 'ay1', 'ay2', 'ay3'];   // only required ones
  optionalDocs = ['other'];
  uploadedFiles: Record<string, File | null> = {};
  uploadedrespfiles: any[] = [];
  allDocuments: any[] = [];
  documentMap: { [key: string]: any } = {};

  imgUrl: string = '';
  imgFileName: string = '';

  otherbusinessdoc: boolean = false;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice, private route: ActivatedRoute, public main: Main) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.incomeForm = this.fb.group({
      assettitle: ['', [Validators.minLength(2), Validators.maxLength(25)]]


    });
    this.requiredDocs.forEach(k => this.uploadedFiles[k] = null);
    this.optionalDocs.forEach(k => this.uploadedFiles[k] = null);
  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  get f() {
    return this.incomeForm.controls;
  }

  documentConfigMap: any = {
    salary1: {

      subcategory: 'SALARY_SLIP_1',
      fileType: 'SALARY'
    },
    salary2: {

      subcategory: 'SALARY_SLIP_2',
      fileType: 'SALARY'
    },
    salary3: {

      subcategory: 'SALARY_SLIP_3',
      fileType: 'SALARY'
    },
    itr: {

      subcategory: 'ITR_LAST_3_YEARS',
      fileType: 'ITR'
    }
  };

  onFileChange(result: UploadResult, key: string,
    subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER') {

    if (!result.file) return;

    const config = this.documentConfigMap[key];

    const fd = new FormData();
    fd.append('category', 'INCOME');
    fd.append('subcategory', subcategory);
    fd.append('title', subcategory);
    fd.append('applicantId', this.applicantId);
    fd.append('files[0].type', type);
    fd.append('files[0].file', result.file);

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {
        console.log("onFileChange", res);

        // this.uploadComponent.setSuccess(res);     
      },
      error: (err) => {

        const errorMsg = err.error?.message || 'Failed to upload file';
        this.uploadComponent.setErrorFromApi(errorMsg);
      }
    });
  }

  onUploadStarted(result: UploadResult, key: string, category: 'INCOME' | 'BUSINESS',
    subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME' | 'BUSINESS_BANK_STATEMENT_1_YEAR' | 'BUSINESS_ITR_3_YEARS' | 'BUSINESS_GST_1_YEAR' | 'BUSINESS_FINANCE_3_YEARS',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER' | 'BUSINESS_BANK_STATEMENT' | 'BUSINESS_ITR' | 'BUSINESS_GST' | 'BUSINESS_FINANCE') {

    if (!result.file) return;

    this.uploadedFiles[key] = result.file;
    const config = this.documentConfigMap[key];

    const fd = new FormData();
    fd.append('category', category);
    fd.append('subcategory', subcategory);
    fd.append('applicantId', this.applicantId);
    fd.append('files[0].title', key);
    fd.append('files[0].type', type);
    fd.append('files[0].file', result.file);

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {

        this.fileresponse.emit(res)
        this.handleresponse = res
        this.uploadedrespfiles.push(res.data)

        // this.uploadedrespfiles.push({ [key]: res.data })
        this.uploadedFiles = { ...  this.uploadedFiles }
        console.log("this.uploadedFiles", this.uploadedrespfiles)
        this.getAllDocuments();
        this.cd.detectChanges();

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

    console.log("Raw docs:", docs);

    // Use type as key, fallback to filename
    this.documentMap = docs.reduce((map, doc) => {
      const key = doc.type || doc.fileName?.trim() || doc.documentId!;
      if (key) {
        map[key] = doc;
      }
      return map;
    }, {} as { [key: string]: Document });

    console.log("documentMap keys:", Object.keys(this.documentMap));
    this.allDocuments = docs;
  }

  getDocumentName(key: any): any {
    const doc = this.getDocumentByKey(key);
    return doc?.fileName || 'No file uploaded';  // Use fileName!
  }

  getDocumentUrl(key: string): string {
    const doc = this.getDocumentByKey(key);
    return doc?.viewUrl || '';  // Use viewUrl!
  }

  get allRequiredFilesUploaded(): boolean {
    return this.requiredDocs.every(key => !!this.getDocumentByKey(key));
  }

  getDocumentByKey(key: string): Document | null {
    return this.documentMap?.[key] || null;
  }

  /** Single function to check if any document exists */
  hasDocument(documentKey: string) {
    const documents = this.allDocuments?.some(item => item.type === documentKey) || false;
    return documents;
  }

  viewImage(url: string): void {
    window.open(url, '_blank');
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
    delete this.documentMap[key];

    this.allDocuments = this.allDocuments.filter(doc => doc.title !== key);

    this.handleresponse = null;

    this.uploadedFiles = { ...this.uploadedFiles };
  }

  submit() { }

  addotherdocuments() { }

  addotherbusinessdocuments() {

    this.otherbusinessdoc = true;
  }
  back() {
    this.stepperService.previous();
  }
  next() {



  }

  // this.stepperService.next();
}

