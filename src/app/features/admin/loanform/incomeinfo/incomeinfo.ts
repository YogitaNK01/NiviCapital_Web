import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Checkbox } from '../../../systemdesign/checkbox/checkbox';
import { Dropdown } from '../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../systemdesign/uploadbtn/uploadbtn';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-incomeinfo',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn,],
  standalone: true,
  templateUrl: './incomeinfo.html',
  styleUrl: './incomeinfo.scss'
})
export class Incomeinfo {
  uploadedFiles = {};
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

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });

    this.incomeForm = this.fb.group({



    });
  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
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

  onFileChange(result: UploadResult, key: string, subcategory: 'LAST_3_MONTHS' | 'FORM_16' | 'BANK_STATEMENT_1_YEAR' | 'ITR_LAST_3_YEARS' | 'OTHER_INCOME',
    type: 'SALARY_SLIP' | 'FORM_16' | 'BANK_STATEMENT' | 'ITR' | 'OTHER') {
    if (!result.file) return;

    const config = this.documentConfigMap[key];

    const fd = new FormData();
    fd.append('category', 'INCOME');
    fd.append('subcategory', subcategory);
    fd.append('applicantId', this.applicantId);
    fd.append('files[0].type', type);
    fd.append('files[0].file', result.file);

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: res => console.log(res)
    });
  }
  onFileChange1(result: UploadResult, controlName: string) {
    if (!result.file) {

      return;
    }

    // this.group.get(controlName)?.setValue(result.file);
  }

  submit() { }

  addotherdocuments() { }
  back() {
    this.stepperService.previous();
  }
  next() {

    const fd = new FormData();

    // text fields
    fd.append('docType', 'PASSPORT');
    fd.append('file', '');

    this.loanformservice.uploadIncome(fd, this.applicationId).subscribe({
      next: (data) => {
        console.log(data);
        this.stepperService.next();
      },
      error: (error) => {
        console.log(error);

      }
    });

  }

  // this.stepperService.next();
}

