import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Input() sectionType!: 'school' | 'bachelors' | 'postgrad';
marksheetCount = 1;
showLC = false;
marksheetlabel = 'Marksheet'

   //dropdowns
  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  passingyear: string = 'Year of Passing';
  selectpassingyr: DropdownOption[] = [
    { label: '2018', value: '2018', icon: '' },
    { label: '2019', value: '2019', icon: '' },
    { label: '2020', value: '2020', icon: '' },
    { label: '2021', value: '2021', icon: '' },
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

    otherDocuments: { id: number; key: string, title: string }[] = [];

  @ViewChild(Uploadbtn) uploadComponent!: Uploadbtn;
  @Output() fileresponse = new EventEmitter<any>();
  handleresponse: any;

  requiredDocs = ['salary1', 'salary2', 'salary3', 'Form16', 'oneyearbankstatement', 'ay1', 'ay2', 'ay3'];   // only required ones
  requiredBusinessDocs = ['businessITR1', 'businessITR2', 'businessITR3', 'businessGST', 'businessBankstatement'];   // only required ones

  optionalDocs = ['other'];
  uploadedFiles: Record<string, File | null> = {};
  uploadedrespfiles: any[] = [];
  allDocuments: any[] = [];
  documentMap: { [key: string]: any } = {};

  imgUrl: string = '';
  imgFileName: string = '';

  otherbusinessdoc: boolean = false;
  otherdoc: boolean = false;
  private slotCounter = 0;

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef,private route: ActivatedRoute,
    public main: Main, private msgBox: Msgboxservice, public loanformservice: Loanformservice) { }

ngOnInit(): void {

  this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

   if (this.sectionType === 'school') {
    this.marksheetCount = 1;
    this.showLC = true;
  }

  if (this.sectionType === 'bachelors') {
    this.marksheetCount = 5;
    this.showLC = false;
  }

  if (this.sectionType === 'postgrad') {
    this.marksheetCount = 3;
    this.showLC = false;
  }


   this.group = this.fb.group({

      institutename: ['', Validators.required],
      passingyear: ['', Validators.required],
      per_cgpa: ['', Validators.required],
      location: ['', Validators.required],
      marksheet: ['', Validators.required],
      lc: ['', Validators.required],
      
    })
console.log(this.group.value);
}

get documentConfig() {
  switch (this.sectionType) {
    case 'school':
      return [
        { label: 'Marksheet', control: 'marksheet' },
        { label: 'School Leaving Certificate', control: 'lc' }
      ];

    case 'bachelors':
      return [
        { label: 'Marksheet of 5 years', control: 'marksheet' },
        
      ];;

    case 'postgrad':
      return [
        { label: 'Marksheet of 3 years', control: 'marksheet' },
      ];

    default:
      return [];
  }
}
 onFileChange(result: UploadResult, controlName: string) {
  if (!result.file) {
    this.group.get(controlName)?.setValue(null);
    return;
  }

  this.group.get(controlName)?.setValue(result.file);
}

 onUploadStarted(
    result: UploadResult, key: string,
    subcategory: '_10TH' | '_12TH' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'IELTS_PTE' | 'OFFER_LETTER' |'OTHER',
    type: 'MARKSHEET' | 'SCHOOL_LEAVING_CERT' | 'DEGREE_CERTIFICATE' | 'UPLOAD_CERTIFICATE' | 'OTHER' ,
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


        this.fileresponse.emit(res)
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

     const id = ++this.slotCounter;
    this.otherDocuments.push({
      id,
      key: `other_business_${id}`,
      title: ''

    });

  }


  back() {

    this.stepperService.previous();
  }
  next() {
    
  }
}
