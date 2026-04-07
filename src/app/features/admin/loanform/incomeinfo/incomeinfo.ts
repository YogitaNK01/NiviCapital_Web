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
import { Msgboxservice } from '../../../../core/service/msgboxservice';


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
  otherdoc: boolean = false;


  otherIncomeSlots: { id: number; key: string }[] = [];
  otherBusinessSlots: { id: number; key: string }[] = [];
  private slotCounter = 0;


  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private msgBox: Msgboxservice, public loanformservice: Loanformservice, private route: ActivatedRoute, public main: Main) { }
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



  onFileChange(result: UploadResult, key: string,
    subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER') {

    if (!result.file) return;


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

  onUploadStarted(result: UploadResult, key: string, category: 'INCOME' | 'BUSINESS' | 'OTHER',
    subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME' | 'BUSINESS_BANK_STATEMENT_1_YEAR' | 'BUSINESS_ITR_3_YEARS' | 'BUSINESS_GST_1_YEAR' | 'BUSINESS_FINANCE_3_YEARS' | 'OTHER_BUSSINESS_INCOME',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER' | 'BUSINESS_BANK_STATEMENT' | 'BUSINESS_ITR' | 'BUSINESS_GST' | 'BUSINESS_FINANCE',
    index?: any) {

    if (!result.file) return;


    this.uploadedFiles[key] = result.file;

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

        // Check for duplicates using documentId
        // const newDocId = res.data[0]?.documentId;
        // const docExists = this.uploadedrespfiles.some(item =>
        //   item.uploadedDocuments?.some((doc: { documentId: any; }) => doc.documentId === newDocId)
        // );
        // if (!docExists) {
        //   this.uploadedrespfiles.push(res.data);
        //   console.log("Added new file response:", res.data);
        // } else {
        //   console.log("Duplicate file skipped:", newDocId);
        // }
        // const uploadedDoc = res.data[0].uploadedDocuments[0];
        // uploadedDoc.key = slotKey;
        // uploadedDoc.slotIndex = index;

        // this.allDocuments.push(uploadedDoc);

        this.uploadedrespfiles.push(res.data)
        this.uploadedFiles = { ...  this.uploadedFiles }
        this.getAllDocuments();
        // this.cd.detectChanges();
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
      const key = doc.type || doc.fileName?.trim() || doc.documentId! || doc.title!;
      if (key) {
        map[key] = doc;
      }
      return map;
    }, {} as { [key: string]: Document });

    console.log("documentMap keys:", Object.keys(this.documentMap));
    this.allDocuments = docs;
    // this.rebuildDocumentMap();
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
    if (!this.allDocuments?.length) return null;

    // let doc = this.allDocuments.find(doc => doc.title === key);
     let doc = this.allDocuments.find(doc =>doc.title === key || doc.type === key);

    if (!doc) {
      doc = this.allDocuments.find(doc =>
        doc.type?.includes(key) ||
        doc.title?.includes(key) ||
        doc.fileName?.includes(key)
      );
    }

    return doc || null;
  }

  


  hasDocument(documentKey: string): boolean {
    return !!this.getDocumentByKey(documentKey);
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
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: '',
      showCancel: true,
      onOk: () => {
        const docToDelete = this.getDocumentByKey(key);
        if (!docToDelete) return;
        console.log("Deleting document:", docToDelete, this.allDocuments);


        this.allDocuments = this.allDocuments.filter(doc =>
          doc.documentId !== docToDelete.documentId
        );
        console.log(this.allDocuments);


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

  submit() { }

  addOtherIncomeDocument(): void {
    const id = ++this.slotCounter;

    this.otherIncomeSlots.push({
      id,
      key: `other_income_${id}`,
     
    });
  }

  addOtherBusinessDocument(): void {
    const id = ++this.slotCounter;

    this.otherBusinessSlots.push({
      id,
      key: `other_business_${id}`,
     
    });
  }


getDocumentBySlot(key: string): any | null {
  if (!this.allDocuments?.length) return null;

  return this.allDocuments.find(doc =>
    doc.title === key ||       
    doc.type === key          
  ) || null;
}

  back() {
    this.stepperService.previous();
  }
  next() {



  }

  // this.stepperService.next();
}

