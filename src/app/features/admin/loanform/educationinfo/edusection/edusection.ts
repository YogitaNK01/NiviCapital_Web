import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { combineLatest } from 'rxjs';

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
  applicantId:any;
  applicationId:any;


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
    file: File | null; key?: string;
  }[] = [];

  @ViewChild(Uploadbtn) uploadComponent!: Uploadbtn;
  @Output() fileSelected = new EventEmitter<SectionFileEvent>();

  @Input() uploadedFiles: Record<string, File | null> = {};
 @Input() savedFileMeta: Record<string, File | null> = {};
 @Input() otherDocMap: Record<string, { title: string }> = {};
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
  filteredInstitutes: any[] = [];
  selectedInstituteID = '';
  selectedInstituteLabel = '';

  selectlocation: OptionItem[] = []
  filteredlocation: any[] = [];
  selectedLocationID = '';
  selectedLocationLabel = '';

  isOtherEducation = false;
  isOtherLocation = false;
  maxOtherDocuments = 5;
  @Output() otherDocAdded = new EventEmitter<number>();

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private route: ActivatedRoute,
    public main: Main, private msgBox: Msgboxservice, public loanformservice: Loanformservice) { }


  ngOnInit(): void {



     let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    // this.custName = Allids[2];
    // this.custARN = Allids[3];
    
combineLatest([
    this.loanformservice.getInstitutesCached(),
    this.loanformservice.getAllCities()
  ]).subscribe(([inst, citiesRes]: any) => {

    this.seleactInstitute = inst;
    this.filteredInstitutes = [...inst];

    const list = citiesRes.data ?? citiesRes;
    this.selectlocation = list.map((c: any) => ({
      value: c.id,
      label: c.name
    }));
    this.filteredlocation = [...this.selectlocation];

    // ✅ restore only after both lists exist
    this.restoreDropdownValues();
  });


    this.cityNames();
    this.selectpassingyr = this.buildYearOptions(20);
    this.initSection();

   

  }
  
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionType'] || changes['title'] || changes['stepKey']) {
      this.initSection();      //   run every time step changes
    }
    
 if (
    changes['uploadedFiles'] ||
    changes['savedFileMeta'] ||
    changes['otherDocMap'] ||
    changes['stepKey']
  ) {
    this.rebuildOtherDocuments();
  }

  }

private initSection(): void {
    // reset defaults
    this.marksheetCount = 1;
    this.showLC = false;

    const t = (this.title || '').toLowerCase();

    if (this.sectionType === 'school' && t.includes('12')) {
      this.marksheetCount = 1;
      this.educationType = '_12TH';
    } else if (this.sectionType === 'school') {
      this.marksheetCount = 1;
      this.educationType = '_10TH';
    } else if (this.sectionType === 'diploma') {
      this.marksheetCount = 3;
      this.educationType = 'DIPLOMA';
    } else if (this.sectionType === 'bachelors') {
      this.marksheetCount = 4;
      this.educationType = 'UNDERGRADUATE';
    } else if (this.sectionType === 'postgrad') {
      this.marksheetCount = 2;
      this.educationType = 'POSTGRADUATE';
    } else if (this.sectionType === 'others' && t.includes('after 12th')) {
      this.marksheetCount = 1;
      this.educationType = 'OTHER_AFTER_12';
    } else if (this.sectionType === 'others' && t.includes('diploma')) {
      this.marksheetCount = 1;
      this.educationType = 'OTHER_AFTER_DIPLOMA';
    }
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

  get isPostGraduate(): boolean {
    return this.educationType === 'POSTGRADUATE';
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

  // getInstituteName() {
  //   this.loanformservice.getInstitutes().subscribe((res: any) => {
  //     const list = res.data ?? res;

  //     this.seleactInstitute = list.map((s: any) => ({
  //       value: s.instituteName, //s.id,
  //       label: s.instituteName,

  //     }));
  //      this.filteredInstitutes = [...this.seleactInstitute];
  //   });
  // }

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


    const control = this.group.get('institutename');
    control?.setValue(ids);
    control?.markAsDirty();
    control?.markAsTouched();
    control?.updateValueAndValidity();



  }

  filterInstitutes(searchText: any) {
    const value = searchText.trim().toLowerCase();

    // Reset list when search is empty
    if (!value) {
      this.filteredInstitutes = [...this.seleactInstitute];
      return;
    }

    //  Special case: user searching "other"
    if (value === 'other') {
      const otherItem = this.seleactInstitute.find(
        item => item.label.toLowerCase() === 'other'
      );

      // Put "Other" at the top
      this.filteredInstitutes = otherItem ? [otherItem] : [];
      return;
    }

    //  Normal search
    this.filteredInstitutes = this.seleactInstitute.filter(item =>
      item.label.toLowerCase().includes(value)
    );
  }

  cityNames() {
    this.loanformservice.getAllCities().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectlocation = list.map((s: any) => ({
        value: s.id,
        label: s.name,

      }));
      
 this.filteredlocation = [...this.selectlocation];
    });
    
  }
  SelectedCity(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.selectlocation.filter(s =>
      ids.includes(s.value)
    );

    this.selectedLocationLabel = selected.map(s => s.label).join(', ');
    this.selectedInstituteID = selected.map(s => s.value).join(', ');

    // this.group.get('location')?.setValue(this.selectedLocationLabel);

    this.isOtherLocation = selected.some(
      s => s.label.trim().toLowerCase() === 'other'
    )

    const control = this.group.get('location');
    // control?.setValue(this.selectedLocationLabel);
    control?.setValue(ids); 
    control?.markAsTouched();
    control?.updateValueAndValidity();

  }

    filtercities(searchText: any) {
    const value = searchText.trim().toLowerCase();

    // Reset list when search is empty
    if (!value) {
      this.filteredlocation = [...this.selectlocation];
      return;
    }

    //  Special case: user searching "other"
    if (value === 'other') {
      const otherItem = this.selectlocation.find(
        item => item.label.toLowerCase() === 'other'
      );

      // Put "Other" at the top
      this.filteredlocation = otherItem ? [otherItem] : [];
      return;
    }

    //  Normal search
    this.filteredlocation = this.selectlocation.filter(item =>
      item.label.toLowerCase().includes(value)
    );
  }

  restoreDropdownValues() {

  const step = this.stepKey;
  const saved = this.group.value;

  if (!saved) return;

  //   Institute restore
  if (saved.institutename) {
    const found = this.seleactInstitute.find(i =>
      i.value === saved.institutename
    );

    if (found) {
      this.selectedInstituteLabel = found.label;
      this.isOtherEducation = (found?.label ?? '').trim().toLowerCase() === 'other';
      this.group.get('institutename')?.setValue(found.value,{ emitEvent: false });
    }
  }

  //  Location restore
  if (saved.location) {
    const foundLoc = this.selectlocation.find(l =>
      l.value === saved.location
    );

    if (foundLoc) {
      this.selectedLocationLabel = foundLoc.label;
      
    this.isOtherLocation = (foundLoc?.label ?? '').trim().toLowerCase() === 'other';

      this.group.get('location')?.setValue(foundLoc.value, { emitEvent: false });
    }
  }
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


  hasLocal1(doc: 'marksheet' | 'lc' | 'other', index?: number): boolean {
    return !!this.uploadedFiles?.[this.buildKey(doc, index)];
  }


  getLocalName1(doc: 'marksheet' | 'lc' | 'other', index?: number): string {
    return this.uploadedFiles?.[this.buildKey(doc, index)]?.name ?? '';
  }
hasLocal(doc: 'marksheet' | 'lc' | 'other', index?: number): boolean {
  return !!this.getStoredFile(doc, index);
}

getLocalName(doc: 'marksheet' | 'lc' | 'other', index?: number): string {
  const file = this.getStoredFile(doc, index);

  if (!file) return '';

  if (file instanceof File) {
    return file.name;
  }

  return file.fileName || file.name || '';
}

  buildKey(doc: DocType, index?: number): string {
    // return index
    //   ? `${this.stepKey}_${doc}_${index}`
    //   : `${this.stepKey}_${doc}`;
    
return index !== undefined
    ? `${this.stepKey}_${doc}_${index}`
    : `${this.stepKey}_${doc}`;

  }
  buildDocKey(level: EducationType, docType: DocType, index?: number): string {
    // return index ? `${level}_${docType}_${index}` : `${level}_${docType}`;
    return index !== undefined
      ? `${level}_${docType}_${index}`
      : `${level}_${docType}`;
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

  viewLocalFile1(doc: DocType, index?: number): void {
    const key = this.buildKey(doc, index);
    const file = this.uploadedFiles[key] as
      | File
      | { viewUrl?: string; fileUrl?: string; publicUrl?: string }
      | null;

    if (!file) return;

    // Case 1: New selected file from browser
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');

      // optional cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return;
    }

    // Case 2: Restored file metadata from API/localStorage
    const savedUrl =
      file.viewUrl ||
      file.fileUrl ||
      file.publicUrl ||
      '';

    if (savedUrl) {
      window.open(savedUrl, '_blank');
      return;
    }

    console.warn('No view URL found for file:', file);

  }
  viewLocalFile(doc: DocType, index?: number): void {
  const file = this.getStoredFile(doc, index);
  if (!file) return;

  if (file instanceof File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const savedUrl = file.viewUrl || file.fileUrl || file.publicUrl || '';
  if (savedUrl) {
    window.open(savedUrl, '_blank');
  }
}

  downloadLocalFile1(doc: DocType, index?: number): void {
  const key = this.buildKey(doc, index);

  const file: any =
    this.uploadedFiles[key] ||
    this.savedFileMeta?.[key];

  if (!file) return;

  // Case 1: newly selected browser file
  if (file instanceof File) {
    const url = URL.createObjectURL(file);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name || 'document';
    a.click();

    URL.revokeObjectURL(url);
    return;
  }

  // Case 2: restored file metadata from API/localStorage
  const savedUrl =
    file.viewUrl ||
    file.fileUrl ||
    file.publicUrl ||
    '';

  if (!savedUrl) {
    console.warn('No downloadable URL found for file:', file);
    return;
  }

  const a = document.createElement('a');
  a.href = savedUrl;
  a.target = '_blank';
  a.download = file.fileName || file.name || 'document';
  a.click();
}
downloadLocalFile(doc: DocType, index?: number): void {
  const file = this.getStoredFile(doc, index);
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

  const savedUrl = file.viewUrl || file.fileUrl || file.publicUrl || '';
  if (!savedUrl) return;

  const a = document.createElement('a');
  a.href = savedUrl;
  a.target = '_blank';
  a.download = file.fileName || file.name || 'document';
  a.click();
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
  // ---------

  // required marksheet count
  isMarksheetRequired(index: number): boolean {
    if (this.sectionType === 'postgrad') return false;

    if (this.sectionType === 'bachelors') return index < 2;

    return index === 0;
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

    this.loanformservice.uploadIncome(fd, this.applicationId, false).subscribe({
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

    if (this.otherDocuments.length >= this.maxOtherDocuments) {
      return;
    }
    const id = ++this.slotCounter;
    this.otherDocuments.push({

      id,
      title: '',
      file: null


    });
    this.otherDocAdded.emit(id);

  }
  onOtherFileChange(result: UploadResult, doc: any) {
    if (!result?.file) return;

    doc.file = result.file;

    // const key = `${this.stepKey}_other_${doc.id}`;
    // this.uploadedFiles[key] = result.file;
    // this.uploadedFiles = { ...this.uploadedFiles };

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

  //delete img
  removeOther(doc: any) {
    this.msgBox.open({

      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,


      onOk: () => {


        // const key = `others_${doc.id}`;
        const key = `${this.stepKey}_other_${doc.id}`;
        this.uploadedFiles[key] = null;
        this.uploadedFiles = { ...this.uploadedFiles };

        const docToUpdate = this.otherDocuments.find(d => d.id === doc.id);

        if (docToUpdate) {
          docToUpdate.file = null;
          this.otherDocuments = [...this.otherDocuments];
        }


      },
    })
  }

  viewOther1(doc: any) {
    window.open(URL.createObjectURL(doc.file), '_blank');
  }
  viewOther(slot: any): void {
  const file = slot.file;
  if (!file) return;

  if (file instanceof File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const url = file.viewUrl || file.fileUrl || file.publicUrl || '';
  if (url) {
    window.open(url, '_blank');
  }
}

  downloadOther1(doc: any) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  downloadOther(slot: any): void {
  const file = slot.file;
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

  const url = file.viewUrl || file.fileUrl || file.publicUrl || '';
  if (!url) return;

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.download = file.fileName || file.name || 'document';
  a.click();
}


  //delete other block (title +img)
  removeOtherDocument(doc: { id: number; title: string; file: File | null }): void {
    this.msgBox.open({

      title: 'Are you sure want to Remove',
      message: ``,
      showCancel: true,


      onOk: () => {
        // const key = `${this.stepKey}_other_${doc.id}`;
        // delete this.uploadedFiles[key];
        // this.uploadedFiles = { ...this.uploadedFiles };

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
  onOtherTitleChange(slot: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    slot.title = value;

    this.fileSelected.emit({
      step: this.stepKey,
      control: 'other',
      index: slot.id,
      file: slot.file,
      gropudata: { title: value }
    });
  }
private rebuildOtherDocuments(): void {
  if (!this.stepKey) return;

  // ✅ use stepKey, not educationType
  const prefix = `${this.stepKey}_other_`;

  const keys = [
    ...Object.keys(this.otherDocMap || {}).filter(k => k.startsWith(prefix)),
    ...Object.keys(this.uploadedFiles || {}).filter(k => k.startsWith(prefix)),
    ...Object.keys(this.savedFileMeta || {}).filter(k => k.startsWith(prefix))
  ];

  const uniqueKeys = [...new Set(keys)].sort((a, b) => {
    return this.extractOtherIndex(a) - this.extractOtherIndex(b);
  });

  this.otherDocuments = uniqueKeys.map((key) => {
    const index = this.extractOtherIndex(key);

    const file =
      this.uploadedFiles[key] ||
      this.savedFileMeta[key] ||
      null;

    const metaTitle = file && !(file instanceof File)
      ? (file as any)?.title
      : null;

    return {
      id: index,   // ✅ keep actual index
      key,
      title:
        this.otherDocMap[key]?.title ||
        (metaTitle && metaTitle !== 'OTHER' ? metaTitle : '') ||
        '',
      file
    };
  });

  // keep counter in sync so Add More gives next correct id
  this.slotCounter = this.otherDocuments.length
    ? Math.max(...this.otherDocuments.map(x => x.id))
    : 0;

  this.cd.detectChanges();
}

private extractOtherIndex(key: string): number {
  const match = key.match(/_other_(\d+)$/);
  return match ? Number(match[1]) : 0;
}
private getStoredFile(doc: DocType, index?: number): any {
  const key = this.buildKey(doc, index);
  return this.uploadedFiles?.[key] || this.savedFileMeta?.[key] || null;
}

  back() {

    this.stepperService.previous();
  }
  next() {

  }
}
