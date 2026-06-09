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
import { ActivatedRoute, Router } from '@angular/router';
import { Main } from '../../../../core/service/main';
import { Msgboxservice } from '../../../../core/service/msgboxservice';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Document {
  title: string;
  name?: string;
  url?: string;
  fileUrl?: string;
  fileName?: String;
  type?: string;
  documentId?: string;
  viewUrl?: string;
  objectKey?: string;
  slotIndex?: number;
  slotKey?: string;
  category?: string;
  subcategory?: string;

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
  applicantId: any;
  applicationId: any;
  incomeForm!: FormGroup

  isbussiness: boolean = false

  @ViewChild(Uploadbtn) uploadComponent!: Uploadbtn;
  @Output() fileresponse = new EventEmitter<any>();
  handleresponse: any;

  requiredDocs = ['salary1', 'salary2', 'salary3', 'Form16', 'oneyearbankstatement', 'ay1', 'ay2', 'ay3'];   // only required ones
  requiredBusinessDocs = ['year1', 'year2', 'year3', 'businessITR1', 'businessITR2', 'businessITR3', 'businessGST', 'businessBankstatement'];   // only required ones

  optionalDocs = ['other'];
  uploadedFiles: Record<string, File | null> = {};
  uploadedrespfiles: any[] = [];
  allDocuments: any[] = [];
  documentMap: { [key: string]: any } = {};

  imgUrl: string = '';
  imgFileName: string = '';

  otherbusinessdoc: boolean = false;
  otherdoc: boolean = false;


  otherIncomeSlots: { id: number; key: string, title: string }[] = [];
  otherBusinessSlots: { id: number; key: string, title: string }[] = [];
  private slotCounter = 0;
  newOtherBusinessTitle: string = '';

  isCoApplicant: boolean = false;
  lastSavedPayload: any = null;
  //save exit saved here
  private incomeSectionMap: Record<string, any> = {
    // salaried
    salary1: {
      sectionKey: 'BATCH_UPLOAD_INCOME_LAST_3_MONTHS',
      category: 'INCOME',
      subcategory: 'LAST_3_MONTHS',
      type: 'SALARY_SLIP'
    },
    salary2: {
      sectionKey: 'BATCH_UPLOAD_INCOME_LAST_3_MONTHS',
      category: 'INCOME',
      subcategory: 'LAST_3_MONTHS',
      type: 'SALARY_SLIP'
    },
    salary3: {
      sectionKey: 'BATCH_UPLOAD_INCOME_LAST_3_MONTHS',
      category: 'INCOME',
      subcategory: 'LAST_3_MONTHS',
      type: 'SALARY_SLIP'
    },

    Form16: {
      sectionKey: 'BATCH_UPLOAD_INCOME_FORM_16',
      category: 'INCOME',
      subcategory: 'FORM_16',
      type: 'FORM_16'
    },

    oneyearbankstatement: {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_STATEMENT_1_YEAR',
      category: 'INCOME',
      subcategory: 'BANK_STATEMENT_1_YEAR',
      type: 'BANK_STATEMENT'
    },

    ay1: {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_ITR_LAST_3_YEARS',
      category: 'INCOME',
      subcategory: 'ITR_LAST_3_YEARS',
      type: 'ITR'
    },
    ay2: {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_ITR_LAST_3_YEARS',
      category: 'INCOME',
      subcategory: 'ITR_LAST_3_YEARS',
      type: 'ITR'
    },
    ay3: {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_ITR_LAST_3_YEARS',
      category: 'INCOME',
      subcategory: 'ITR_LAST_3_YEARS',
      type: 'ITR'
    },

    // business
    year1: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_FINANCE_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_FINANCE_3_YEARS',
      type: 'BUSINESS_FINANCE'
    },
    year2: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_FINANCE_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_FINANCE_3_YEARS',
      type: 'BUSINESS_FINANCE'
    },
    year3: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_FINANCE_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_FINANCE_3_YEARS',
      type: 'BUSINESS_FINANCE'
    },

    businessITR1: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_ITR_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_ITR_3_YEARS',
      type: 'BUSINESS_ITR'
    },
    businessITR2: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_ITR_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_ITR_3_YEARS',
      type: 'BUSINESS_ITR'
    },
    businessITR3: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_ITR_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_ITR_3_YEARS',
      type: 'BUSINESS_ITR'
    },

    businessGST: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_GST_1_YEAR',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_GST_1_YEAR',
      type: 'BUSINESS_GST'
    },

    businessBankstatement: {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_BANK_STATEMENT_1_YEAR',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_BANK_STATEMENT_1_YEAR',
      type: 'BUSINESS_BANK_STATEMENT'
    }
  };

  //get saved data
  incomeDraftSections = [
    // Salaried
    {
      sectionKey: 'BATCH_UPLOAD_INCOME_LAST_3_MONTHS',
      category: 'INCOME',
      subcategory: 'LAST_3_MONTHS',
      documentType: 'SALARY_SLIP'
    },
    {
      sectionKey: 'BATCH_UPLOAD_INCOME_FORM_16',
      category: 'INCOME',
      subcategory: 'FORM_16',
      documentType: 'FORM_16'
    },
    {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_STATEMENT_1_YEAR',
      category: 'INCOME',
      subcategory: 'BANK_STATEMENT_1_YEAR',
      documentType: 'BANK_STATEMENT'
    },
    {
      sectionKey: 'BATCH_UPLOAD_INCOME_BANK_ITR_LAST_3_YEARS',
      category: 'INCOME',
      subcategory: 'ITR_LAST_3_YEARS',
      documentType: 'ITR'
    },

    // Other salaried income documents
    {
      sectionKey: 'BATCH_UPLOAD_OTHER_INCOME',
      category: 'OTHER',
      subcategory: 'OTHER_INCOME',
      documentType: 'OTHER'
    },

    // Business
    {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_FINANCE_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_FINANCE_3_YEARS',
      documentType: 'BUSINESS_FINANCE'
    },
    {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_ITR_3_YEARS',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_ITR_3_YEARS',
      documentType: 'BUSINESS_ITR'
    },
    {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_GST_1_YEAR',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_GST_1_YEAR',
      documentType: 'BUSINESS_GST'
    },
    {
      sectionKey: 'BATCH_UPLOAD_BUSINESS_BANK_STATEMENT_1_YEAR',
      category: 'BUSINESS',
      subcategory: 'BUSINESS_BANK_STATEMENT_1_YEAR',
      documentType: 'BUSINESS_BANK_STATEMENT'
    },

    // Other business income documents
    {
      sectionKey: 'BATCH_UPLOAD_OTHER_BUSSINESS_INCOME',
      category: 'OTHER',
      subcategory: 'OTHER_BUSSINESS_INCOME',
      documentType: 'OTHER'
    }
  ];
  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private router: Router, private cd: ChangeDetectorRef, private msgBox: Msgboxservice, public loanformservice: Loanformservice, private route: ActivatedRoute, public main: Main) { }
  async ngOnInit(): Promise<void> {
    this.isCoApplicant = this.router.url.includes('co-applicant');

    this.stepperService.setStepperType(
      this.isCoApplicant ? 'CO_APPLICANT' : 'MAIN'
    );
    this.restoreStepperFlagsAfterRefresh();


    let Allids = this.stepperService.getLoanId();
    this.applicantId = Allids[0];
    this.applicationId = Allids[1];


    let AllCoapp_ids = this.stepperService.getCo_appId();

    if (
      this.isCoApplicant &&
      (!AllCoapp_ids || !AllCoapp_ids[0] || !AllCoapp_ids[1])
    ) {

      const storedCoApp = sessionStorage.getItem('coAppIds');
      if (storedCoApp) {
        const parsed = JSON.parse(storedCoApp);

        AllCoapp_ids = [
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName
        ];

        // restore back into service
        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
        undefined,this.stepperService.getCurrentCoApplicantIndex());
      }
    }
    // this.applicantId = this.isCoApplicant ? AllCoapp_ids[0] : Allids[0];
    if (this.isCoApplicant) {
      this.applicantId = AllCoapp_ids?.[0];
      this.applicationId = AllCoapp_ids?.[1];
    } else {
      this.applicantId = Allids?.[0];
      this.applicationId = Allids?.[1];
    }
    this.stepperService.rebuildSteps();
    this.incomeForm = this.fb.group({
      assettitle: ['', [Validators.minLength(2), Validators.maxLength(25)]]


    });
    this.requiredDocs.forEach(k => this.uploadedFiles[k] = null);
    this.optionalDocs.forEach(k => this.uploadedFiles[k] = null);
    this.requiredBusinessDocs.forEach(k => this.uploadedFiles[k] = null);


    const key = this.getStorageKey();
    // 1 try stepper cache
    const stepData = this.stepperService.getStepData(this.getStepRoute());

    if (stepData) {
      this.uploadedrespfiles = stepData.uploadedFiles || [];
      this.otherIncomeSlots = stepData.otherIncomeSlots || [];
      this.otherBusinessSlots = stepData.otherBusinessSlots || [];


      this.getAllDocuments();
      this.restoreSlotsFromDocuments();
      return;


    }
     if (this.loanformservice.isEditFlow()) {
      setTimeout(() => {
        this.patchFromSummary();
      }, 300);
    } else {

    //2. Then try localStorage

    const stored = localStorage.getItem(this.getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored);
      this.uploadedrespfiles = parsed.uploadedFiles || parsed || [];
      this.otherIncomeSlots = parsed.otherIncomeSlots || [];
      this.otherBusinessSlots = parsed.otherBusinessSlots || [];

      this.getAllDocuments();
      this.restoreSlotsFromDocuments();
    }



    // 3. Then call API.

    const savedDraftData = await this.getSavedIncomeData();

    if (savedDraftData?.length) {
      this.restoreIncomeDraftData(savedDraftData);
    }
  }
  }

  getStorageKey() {
     const index = this.stepperService.getCurrentCoApplicantIndex();
    // return `kycinfo_coapp_${this.applicantId}_${index}`;
    return this.isCoApplicant
      ? `IncomeInfoData_coapp_${this.applicantId}_${index}`
      : `IncomeInfoData_main_${this.applicantId}`;
  }
  get currentApplicantState() {
    return this.isCoApplicant
      ? this.loanformservice.coApplicantState
      : this.loanformservice.applicantState;
  }
  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  get f() {
    return this.incomeForm.controls;
  }

  removeOtherDocument(type: 'other' | 'otherbusiness', id: number): void {
    this.msgBox.open({
      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,
      onOk: () => {


        if (type === 'other') {
          this.otherIncomeSlots = this.otherIncomeSlots.filter(slot => slot.id !== id);
        } else {
          this.otherBusinessSlots = this.otherBusinessSlots.filter(slot => slot.id !== id);
        }

      }
    });


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


  onUploadStarted(
    result: UploadResult, key: string, category: 'INCOME' | 'BUSINESS' | 'OTHER',
    subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME' | 'BUSINESS_BANK_STATEMENT_1_YEAR' | 'BUSINESS_ITR_3_YEARS' | 'BUSINESS_GST_1_YEAR' | 'BUSINESS_FINANCE_3_YEARS' | 'OTHER_BUSSINESS_INCOME',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER' | 'BUSINESS_BANK_STATEMENT' | 'BUSINESS_ITR' | 'BUSINESS_GST' | 'BUSINESS_FINANCE',
    othertitle?: any) {

    if (!result.file) return;


    this.uploadedFiles[key] = result.file;

    const fd = new FormData();
    fd.append('category', category);
    fd.append('subcategory', subcategory);
    fd.append('applicantId', this.applicantId);
    fd.append('files[0].title', othertitle || key);
    fd.append('files[0].type', type);
    fd.append('files[0].file', result.file);

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: (res) => {


        this.fileresponse.emit(res)
        this.handleresponse = res
        // this.uploadedrespfiles.push(res.data)

        const uploadedData = this.normalizeUploadResponse(res.data, key, category, subcategory, type, othertitle);

        this.uploadedrespfiles.push(uploadedData);


        this.uploadedFiles = { ...  this.uploadedFiles }


        const key1 = this.getStorageKey()
        localStorage.setItem(key1, JSON.stringify(this.uploadedrespfiles));

        this.getAllDocuments();
        // this.cd.detectChanges();
      },
      error: (err) => {

        const errorMsg = err.error?.message || 'Failed to upload file';
        this.uploadComponent.setErrorFromApi(errorMsg);
      }
    });
  }
  private normalizeUploadResponse(
    data: any,
    slotKey: string,
    category: string,
    subcategory: string,
    type: string,
    title?: any
  ): any {
    if (!data) return data;

    const uploadedDocuments = data.uploadedDocuments || [];

    const normalizedDocuments = uploadedDocuments.map((doc: any, index: number) => ({
      ...doc,
      slotKey: slotKey,
      title: title || slotKey,
      type: doc.type || type,
      category: doc.category || category,
      subcategory: doc.subcategory || subcategory,
      slotIndex: index
    }));

    return {
      ...data,
      category,
      subcategory,
      uploadedDocuments: normalizedDocuments
    };
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
    this.rebuildDocumentMap();
  }

  getDocumentName(key: any): any {
    const doc = this.getDocumentByKey(key);
    return doc?.fileName || doc?.title || 'No file uploaded';  // Use fileName!
  }


  getDocumentUrl(key: string): string {
    const doc = this.getDocumentByKey(key);
    // return doc?.viewUrl || '';  // Use viewUrl!


    const url = doc?.viewUrl || '';

    if (!url || url === 'NA') return '';

    if (url.startsWith('http')) {
      return url;
    }

    return `${window.location.origin}${url}`;

  }


  get allRequiredFilesUploaded1(): boolean {
    if (this.currentApplicantState.issalaried) {
      return this.requiredDocs.every(key => !!this.getDocumentByKey(key));
    } else {
      return this.requiredBusinessDocs.every(key => !!this.getDocumentByKey(key));
    }
    // return this.requiredDocs.every(key => !!this.getDocumentByKey(key));
  }

  get allRequiredFilesUploaded(): boolean {
    const required = this.currentApplicantState.issalaried
      ? this.requiredDocs
      : this.requiredBusinessDocs;

    const missing = required.filter(key => !this.getDocumentByKey(key));

    console.log('Required docs:', required);
    console.log('Available docs:', this.allDocuments.map(d => ({
      slotKey: d.slotKey,
      title: d.title,
      fileName: d.fileName,
      type: d.type
    })));
    console.log('Missing docs:', missing);

    return missing.length === 0;
  }




  get isOtherSelected(): boolean {
    if (this.currentApplicantState.issalaried) {
      return Array.isArray(this.otherIncomeSlots) && this.otherIncomeSlots.length > 0;

    }
    return Array.isArray(this.otherBusinessSlots) && this.otherBusinessSlots.length > 0;
  }


  isOtherDocumentValid(): boolean {

    if (this.currentApplicantState.issalaried) {
      return this.otherIncomeSlots.every(slot =>
        slot.title &&
        slot.title.trim().length > 0 &&
        !!this.getDocumentByKey(slot.title)
      );
    }

    return this.otherBusinessSlots.every(slot =>
      slot.title &&
      slot.title.trim().length > 0 &&
      !!this.getDocumentByKey(slot.title)
    );
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


    if (this.documentMap[key]) {
      return this.documentMap[key];
    }


    let doc = this.allDocuments.find(d => d.type === key || d.title === key || d.fileName === key || d.slotKey === key);
    const normalizedKey = key.toLowerCase();
    if (!doc) {
      doc = this.allDocuments.find(d =>
        // (d.type && d.type.includes(key)) ||
        // (d.title && d.title.includes(key)) ||
        // (d.fileName && d.fileName.includes(key)) ||
        // (d.slotKey && d.slotKey.includes(key))

        d.slotKey?.toLowerCase() === normalizedKey ||
        d.title?.toLowerCase() === normalizedKey ||
        d.fileName?.toLowerCase() === normalizedKey ||
        d.type?.toLowerCase() === normalizedKey

      );
    }

    return doc || null;
    // return (
    //   this.allDocuments.find(doc => doc.title === key) || null
    // );

    // return this.allDocuments.find(doc =>
    //     doc.type === key ||
    //     doc.title === key ||
    //     doc.fileName === key ||
    //     doc.title?.includes(key) ||
    //     doc.fileName?.includes(key)
    //   ) || null;

  }


  hasDocument(documentKey: string): boolean {
    return !!this.getDocumentByKey(documentKey);
  }
  viewImage(url: string): void {
    window.open(url, '_blank');
  }

  downloadImage1(url: string, filename: string): void {
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
  downloadImage(url: string, filename: string): void {
    if (!url || url === 'NA') {
      console.error('Invalid document URL');
      return;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Download failed');
        }
        return res.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'document';
        link.click();

        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => {
        console.error('Download failed:', err);
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
        const keyLocal = this.getStorageKey();
        localStorage.setItem(keyLocal, JSON.stringify(this.uploadedrespfiles));

        this.cd.detectChanges();



      }
    });
  }
  restoreSlotsFromDocuments1() {
    let counter = 0;

    this.allDocuments.forEach(doc => {
      if (doc.type === 'OTHER') {
        counter++;

        if (this.currentApplicantState.issalaried) {
          this.otherIncomeSlots.push({
            id: counter,
            key: `other_income_${counter}`,
            title: doc.title || ''
          });
        } else {
          this.otherBusinessSlots.push({
            id: counter,
            key: `other_business_${counter}`,
            title: doc.title || ''
          });
        }
      }
    });
  }
  restoreSlotsFromDocuments() {
    this.otherIncomeSlots = [];
    this.otherBusinessSlots = [];

    let incomeCounter = 0;
    let businessCounter = 0;

    this.allDocuments.forEach(doc => {
      if (doc.type !== 'OTHER') return;

      const subcategory = doc.subcategory || doc.documentSubcategory || '';

      if (
        subcategory === 'OTHER_BUSSINESS_INCOME' ||
        subcategory === 'OTHER_BUSINESS_INCOME'
      ) {
        businessCounter++;

        this.otherBusinessSlots.push({
          id: businessCounter,
          key: `other_business_${businessCounter}`,
          title: doc.title || ''
        });
      } else {
        incomeCounter++;

        this.otherIncomeSlots.push({
          id: incomeCounter,
          key: `other_income_${incomeCounter}`,
          title: doc.title || ''
        });
      }
    });

    this.slotCounter = incomeCounter + businessCounter;
  }

  // edit flow =patch from summary

patchFromSummary() {
  if (!this.loanformservice.isEditFlow()) return;

  const income = this.loanformservice.getSummarySection('incomeDetails');
  const business = this.loanformservice.getSummarySection('incomeBusinessDetails');

  console.log("PATCH SUMMARY:", income, business);

  if (!income && !business) return;

  this.allDocuments = [];
  this.otherIncomeSlots = [];
  this.otherBusinessSlots = [];

  const buildDoc = (item: any) => {
    const key = item.name;

    return {
      documentId: key,
      title: key,
      slotKey: key,
      fileName: item.url,
      type: key,
      viewUrl: this.buildViewUrl(item.url)
    };
  };

  // SALARIED FLOW
  if (this.isSalariedUser() && income) {

    income.salarySlips?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    income.bankStatements?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    income.form16?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    income.itrs?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    // OTHER INCOME
    income.otherIncome?.forEach((item: any, i: number) => {
      const key = item.name || `other_income_${i + 1}`;

      this.otherIncomeSlots.push({
        id: i + 1,
        key,
        title: key
      });

      this.allDocuments.push(buildDoc({ name: key, url: item.url }));
    });
  }

  // BUSINESS FLOW
  if (!this.isSalariedUser() && business) {

    business.business_finance_3_years?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    business.business_itr_3_years?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    business.business_gst_1_year?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    business.business_bank_statement_1_year?.forEach((item: any) =>
      this.allDocuments.push(buildDoc(item))
    );

    // OTHER BUSINESS
    business.otherBussinessincome?.forEach((item: any, i: number) => {
      const key = item.name || `other_business_${i + 1}`;

      this.otherBusinessSlots.push({
        id: i + 1,
        key,
        title: key
      });

      this.allDocuments.push(buildDoc({ name: key, url: item.url }));
    });
  }

 // FINAL STEP (VERY IMPORTANT)
  this.rebuildDocumentMap();

  const stepData = {
    uploadedFiles: [],
    otherIncomeSlots: this.otherIncomeSlots,
    otherBusinessSlots: this.otherBusinessSlots
  };

  const key = this.getStorageKey();

  localStorage.setItem(key, JSON.stringify(stepData));

  this.stepperService.setStepData(this.getStepRoute(), stepData);

  if (this.isCoApplicant) {
    this.loanformservice.co_incomeInfoData = stepData;
  } else {
    this.loanformservice.incomeInfoData = stepData;
  }

  console.log("FINAL DOC MAP:", this.documentMap);

  this.cd.detectChanges();
}
buildViewUrl(fileName: string): string {
  if (!fileName) return '';

  if (fileName.startsWith('http')) {
    return fileName;
  }

  return `${window.location.origin}/files/${fileName}`;
}


isSalariedUser(): boolean {
  return this.currentApplicantState?.issalaried;
}


  restoreIncomeDraftData(savedResponses: any[]): void {
    if (!savedResponses?.length) return;

    const restoredUploadedRespFiles: any[] = [];
    const restoredDocuments: Document[] = [];

    this.otherIncomeSlots = [];
    this.otherBusinessSlots = [];

    let salaryCounter = 0;
    let itrCounter = 0;
    let businessFinanceCounter = 0;
    let businessItrCounter = 0;
    let incomeOtherCounter = 0;
    let businessOtherCounter = 0;

    savedResponses.forEach(item => {
      const section = item?.section;
      const draft = item?.data;

      if (!draft) return;

      const draftData = draft?.data || draft;

      const uploadedFiles = draftData?.uploadedFiles || [];
      const uploadedDocuments = draftData?.uploadedDocuments || [];

      if (!uploadedFiles.length && !uploadedDocuments.length) return;

      const normalizedDocs: Document[] = [];

      uploadedFiles.forEach((file: any, index: number) => {
        const matchingDoc = uploadedDocuments[index] || {};

        let slotKey = '';

        switch (section?.documentType) {
          case 'SALARY_SLIP':
            salaryCounter++;
            slotKey = `salary${salaryCounter}`;
            break;

          case 'FORM_16':
            slotKey = 'Form16';
            break;

          case 'BANK_STATEMENT':
            slotKey = 'oneyearbankstatement';
            break;

          case 'ITR':
            itrCounter++;
            slotKey = `ay${itrCounter}`;
            break;

          case 'BUSINESS_FINANCE':
            businessFinanceCounter++;
            slotKey = `year${businessFinanceCounter}`;
            break;

          case 'BUSINESS_ITR':
            businessItrCounter++;
            slotKey = `businessITR${businessItrCounter}`;
            break;

          case 'BUSINESS_GST':
            slotKey = 'businessGST';
            break;

          case 'BUSINESS_BANK_STATEMENT':
            slotKey = 'businessBankstatement';
            break;

          case 'OTHER':
            if (section?.sectionKey === 'BATCH_UPLOAD_OTHER_BUSSINESS_INCOME') {
              businessOtherCounter++;
              slotKey = matchingDoc.title || file.fileName || `other_business_${businessOtherCounter}`;

              this.otherBusinessSlots.push({
                id: businessOtherCounter,
                key: `other_business_${businessOtherCounter}`,
                title: slotKey
              });
            } else {
              incomeOtherCounter++;
              slotKey = matchingDoc.title || file.fileName || `other_income_${incomeOtherCounter}`;

              this.otherIncomeSlots.push({
                id: incomeOtherCounter,
                key: `other_income_${incomeOtherCounter}`,
                title: slotKey
              });
            }
            break;

          default:
            slotKey = matchingDoc.title || file.fileName || section?.documentType;
        }

        normalizedDocs.push({
          documentId: matchingDoc.documentId,
          title: slotKey,
          slotKey: slotKey,
          fileName: file.fileName || matchingDoc.fileName || matchingDoc.title,
          type: file.type || matchingDoc.type || section?.documentType,
          objectKey: file.objectKey || matchingDoc.objectKey,
          viewUrl: file.viewUrl || matchingDoc.viewUrl,
          category: draftData.category || section?.category,
          subcategory: draftData.subcategory || section?.subcategory,
          slotIndex: index
        });
      });

      if (normalizedDocs.length) {
        restoredDocuments.push(...normalizedDocs);

        restoredUploadedRespFiles.push({
          ...draftData,
          uploadedDocuments: normalizedDocs
        });
      }
    });

    this.uploadedrespfiles = restoredUploadedRespFiles;
    this.allDocuments = restoredDocuments;

    this.slotCounter = incomeOtherCounter + businessOtherCounter;

    this.rebuildDocumentMap();

    const stepData = {
      uploadedFiles: this.uploadedrespfiles,
      otherIncomeSlots: this.otherIncomeSlots,
      otherBusinessSlots: this.otherBusinessSlots
    };



    if (this.isCoApplicant) {
      this.loanformservice.co_incomeInfoData = stepData;
    } else {
      this.loanformservice.incomeInfoData = stepData;
    }


    this.stepperService.setStepData(this.getStepRoute(), stepData);

    localStorage.setItem(this.getStorageKey(), JSON.stringify(stepData));

    this.cd.detectChanges();
  }
  private rebuildDocumentMap(): void {
    const docs = this.allDocuments || [];
    this.documentMap = docs.reduce((map, doc) => {
      const key = doc.type || doc.fileName?.trim() || doc.fileName?.toString().trim() || doc.documentId! || doc.slotKey || doc.title;
      if (key) {
        map[key] = doc;
      }
      return map;
    }, {} as { [key: string]: Document });
  }

  submit() { }

  onTitleInput(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.newOtherBusinessTitle = value;

  }

  addOtherIncomeDocument(): void {
    const id = ++this.slotCounter;

    this.otherIncomeSlots.push({
      id,
      key: `other_income_${id}`,
      title: ''

    });
  }

  addOtherBusinessDocument(): void {


    const id = ++this.slotCounter;
    this.otherBusinessSlots.push({
      id,
      key: `other_business_${id}`,
      title: ''

    });
    // this.newOtherBusinessTitle = '';
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

  //get api for saved data
  getSavedIncomeData(): Promise<any[]> {
    const requests = this.incomeDraftSections.map(section => {
      return this.loanformservice.getUploadedData(
        this.applicationId,
        this.applicantId,
        section.sectionKey,
        section.category,
        section.subcategory,
        section.documentType
      ).pipe(
        map((res: any) => {
          if (res?.status === 'success') {
            return {
              section,
              data: res.data?.data || res.data || null
            };
          }

          return {
            section,
            data: null
          };
        }),
        catchError(err => {
          console.error('Draft get failed for section:', section.sectionKey, err);

          return of({
            section,
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
        error: () => resolve([])
      });
    });
  }
  private getIncomeMetaByFileKey(fileKey: string): any {
    // 1. Fixed document mapping
    if (this.incomeSectionMap[fileKey]) {
      return this.incomeSectionMap[fileKey];
    }

    // 2. Other salaried income documents
    const isOtherIncome =
      this.otherIncomeSlots?.some(slot =>
        slot.key === fileKey || slot.title === fileKey
      );

    if (isOtherIncome) {
      return {
        sectionKey: 'BATCH_UPLOAD_OTHER_INCOME',
        category: 'OTHER',
        subcategory: 'OTHER_INCOME',
        type: 'OTHER',
        title: fileKey
      };
    }

    // 3. Other business income documents
    const isOtherBusiness =
      this.otherBusinessSlots?.some(slot =>
        slot.key === fileKey || slot.title === fileKey
      );

    if (isOtherBusiness) {
      return {
        sectionKey: 'BATCH_UPLOAD_OTHER_BUSSINESS_INCOME',
        category: 'OTHER',
        subcategory: 'OTHER_BUSSINESS_INCOME',
        type: 'OTHER',
        title: fileKey
      };
    }

    return null;
  }
  private restoreStepperFlagsAfterRefresh(): void {
    if (this.isCoApplicant) {
      const coState = JSON.parse(localStorage.getItem('coApplicantState') || '{}');

      this.loanformservice.coApplicantState = {
        ...this.loanformservice.coApplicantState,
        ...coState
      };

      this.stepperService.setApplicantValues('coapp', {
        isasset: this.loanformservice.coApplicantState.isasset,
        isincome: this.loanformservice.coApplicantState.isincome,
        issalaried: this.loanformservice.coApplicantState.issalaried
      });

    } else {
      const mainState = JSON.parse(localStorage.getItem('applicantState') || '{}');

      this.loanformservice.applicantState = {
        ...this.loanformservice.applicantState,
        ...mainState
      };

      this.stepperService.setApplicantValues('main', {
        isasset: this.loanformservice.applicantState.isasset,
        isincome: this.loanformservice.applicantState.isincome,
        issalaried: this.loanformservice.applicantState.issalaried,
        coursetypeug: this.loanformservice.applicantState.coursetypeug
      });
    }
  }
  saveExit() {
    const key = this.getStorageKey();

    const stepData = {
      uploadedFiles: this.uploadedrespfiles,
      otherIncomeSlots: this.otherIncomeSlots,
      otherBusinessSlots: this.otherBusinessSlots
    };

    localStorage.setItem(key, JSON.stringify(stepData));

    const requests = this.buildDraftUploadRequests();

    if (!requests.length) {
      console.log('No files selected for draft save');

      return;
    }

    forkJoin(requests).subscribe({
      next: (responses) => {
        console.log('Income draft saved successfully:', responses);


        if (this.isCoApplicant) {
          this.loanformservice.co_incomeInfoData = stepData;
        } else {
          this.loanformservice.incomeInfoData = stepData;
        }


        this.stepperService.setStepData(this.getStepRoute(), stepData);


      },
      error: (err) => {
        console.error('Income draft save failed:', err);

        const errorMsg = err.error?.message || 'Failed to save income draft';
        this.msgBox.open({
          title: 'Error',
          message: errorMsg,
          showCancel: false
        });
      }
    });
  }

  private buildDraftUploadRequests() {
    const grouped: Record<string, any> = {};

    Object.keys(this.uploadedFiles).forEach(fileKey => {
      const file = this.uploadedFiles[fileKey];

      if (!file) return;

      const meta = this.getIncomeMetaByFileKey(fileKey);

      if (!meta) {
        console.warn('No section mapping found for:', fileKey);
        return;
      }

      const groupKey = meta.sectionKey;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          sectionKey: meta.sectionKey,
          category: meta.category,
          subcategory: meta.subcategory,
          files: []
        };
      }

      grouped[groupKey].files.push({
        file,
        type: meta.type,
        title: meta.title || fileKey
      });
    });

    return Object.values(grouped).map((group: any) => {
      const fd = new FormData();

      fd.append('applicationId', this.applicationId);
      fd.append('applicantId', this.applicantId);
      fd.append('sectionKey', group.sectionKey);
      fd.append('category', group.category);
      fd.append('subcategory', group.subcategory);

      group.files.forEach((item: any, index: number) => {
        fd.append(`files[${index}].type`, item.type);
        fd.append(`files[${index}].title`, item.title);
        fd.append(`files[${index}].file`, item.file);
      });

      return this.loanformservice.saveandExit(fd);
    });
  }

  getStepRoute() {
    return this.isCoApplicant ? 'co-incomeinfo' : 'incomeinfo';
  }
  next() {

    console.log('allRequiredFilesUploaded:', this.allRequiredFilesUploaded);
    if (!this.allRequiredFilesUploaded) return;
    if (this.allRequiredFilesUploaded) {

      const stepData = {
        uploadedFiles: this.uploadedrespfiles,
        otherIncomeSlots: this.otherIncomeSlots,
        otherBusinessSlots: this.otherBusinessSlots
      };


      const key = this.getStorageKey();
      const stepRoute = this.getStepRoute();

      localStorage.setItem(key, JSON.stringify(stepData));

      if (this.isCoApplicant) {
        this.loanformservice.co_incomeInfoData = stepData;

      } else {
        this.loanformservice.incomeInfoData = stepData;

      }

      this.stepperService.setStepData(stepRoute, stepData);
      this.stepperService.markStepCompleted(stepRoute);



      // this.stepperService.next();

      const beforeUrl = this.router.url;

      console.log('Before stepperService.next()', beforeUrl);

      this.stepperService.next();

      setTimeout(() => {

      }, 100);


    }
  }


}

