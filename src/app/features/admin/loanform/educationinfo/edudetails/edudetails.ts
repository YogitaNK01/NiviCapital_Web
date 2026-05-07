import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { Dropdown } from '../../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../../systemdesign/inputfield/inputfield';
import { Uploadbtn, UploadConfig } from '../../../../systemdesign/uploadbtn/uploadbtn';
import { Edusection } from '../edusection/edusection';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Loanformservice } from '../../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';
import { Msgboxservice } from '../../../../../core/service/msgboxservice';

interface OptionItem {
  label: string;
  value: string;
  code?: string;
}

interface CourseTypeSelection {
  isAsset: boolean;
  isIncome: boolean;
  issalaried: boolean;
  coursetypeug: boolean;
}
@Component({
  selector: 'app-edudetails',
  imports: [CommonModule, Buttons, ReactiveFormsModule, Uploadbtn, Inputfield, Edusection, Dropdown, RouterOutlet],
  standalone: true,
  templateUrl: './edudetails.html',
  styleUrl: './edudetails.scss'
})
export class Edudetails {

  uploadedFiles = {};
  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };
  qualification: string = 'Last Qualification';
  seleactqualification: OptionItem[] = []
  selectedLabel = '';
  selectedID = '';

  seleactInstitute: OptionItem[] = []
  selectedInstituteID = '';
  selectedInstituteLabel = '';
  selectedQualificationLabel = ''

  educationdetails: any;
  qualificationId!: string;

  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';

  activeEducation!: '10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg';

  educationOrder: Array<'10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg'> = ['10th', '12th', 'diploma10', 'diploma12', 'ug', 'pg'];

  private educationRank: Record<string, number> = {
    '10th': 1,
    '12th': 2,
    'diploma10': 3,
    'diploma12': 4,
    'ug': 5,
    'ugdiploma': 6,
    'pg': 6,
    'pgafterdiploma': 7,
    'other12': 7,
    'otherdiploma': 8,


    //  '10th': 1,
    //   '12th': 2,
    //   'diploma': 3,
    //   'ug': 4,
    //   'pg': 5,
    //   'others': 6


  };
  private educationDisplayLabel: Record<string, string> = {
    '10th': '10th',
    '12th': '12th',
    'diploma10': 'Diploma (After 10th)',
    'diploma12': 'Diploma (After 12th)',
    'ug': 'Undergraduate',
    'pg': 'Postgraduate',
    'others12': 'Others (After 12th)',
    'othersdiploma': 'Others (After Diploma)'


    // '10th': '10th',
    //   '12th': '12th',
    //   'diploma': 'Diploma',
    //   'ug': 'Undergraduate',
    //   'pg': 'Postgraduate',
    //   'others': 'Others'

  };


  educationForms: any = {};
  isChildRouteActive = false;

  isOtherQualification = false;
  isOtherEducation = false;

  selectedcoursetype: any;
  basicform!: FormGroup;

  hasProceededOnce = false;


  private previousEducationId: string | null = null;



  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private formSvc: Loanformservice, private msgbox: Msgboxservice,
    private route: ActivatedRoute, private router: Router) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];
        this.custName = params['custName'];
        this.custARN = params['custARN'];

        this.stepperService.setLoanId(this.applicantId, this.applicationId, this.custName, this.custARN);
      }
    });



    this.getEducationdetails();
    this.getInstituteName();

    this.selectedcoursetype = localStorage.getItem('coursetypeug') === 'true';
    console.log('aaaaaaaaaaaaa', this.selectedcoursetype)

    this.basicform = this.fb.group({
      qualification: ['', [Validators.required, this.qualificationVsCourseTypeValidator()]],
      // qualification: ['', [Validators.required]],
      qualificationtitle: [''],
      institute: ['', Validators.required],
      institutetitle: ['']
    })


    this.hasProceededOnce = !!this.previousEducationId;

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

  getInstituteName() {
    this.formSvc.getInstitutes().subscribe((res: any) => {
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

    // this.isOtherEducation = this.selectedInstituteLabel.toLowerCase().includes('other');

    this.isOtherEducation = selected.some(
      s => s.label.trim().toLowerCase() === 'other'
    )


  }

//current selected section (1popup left box)
  private getCurrentSections(): string[] {
    if (!this.educationdetails) return [];

    const sections = this.educationdetails.map((d: any) =>
      d.qualificationName.includes('Others')
        ? d.qualificationName
        : d.qualificationName
    );

    sections.push("IELTS / PTE")
    sections.push("University Offer Letter")
    return sections;
  }

//all selected selection in 2nd popup
  private getSectionRequiredList(newQualificationId: string): string[] {
    const newLabel = this.getAddingSectionLabel(newQualificationId);
    const newKey = this.normalizeQualification(newLabel);
    const newRank = this.educationRank[newKey];

    const result: string[] = [];

    const sectionMap = new Map<string, string>();

    this.educationdetails.forEach((d: any) => {
      const key = this.normalizeQualification(d.qualificationName);
      const rank = this.educationRank[key];

      if (rank && rank <= newRank) {
        // result.push(d.qualificationName);
        sectionMap.set(key, this.educationDisplayLabel[key]);
      }
    });

    // if (!result.some(r => r.toLowerCase().includes(newLabel.toLowerCase()))) {
    //   result.push(newLabel);
    // }
    // result.push('IELTS / PTE');
    // result.push('University Offer Letter');
    // return Array.from(new Set(result));


    sectionMap.set(newKey, this.educationDisplayLabel[newKey]);
    sectionMap.set('ielts', 'IELTS / PTE');
    sectionMap.set('offer', 'University Offer Letter');

    return Array.from(sectionMap.values());

  }


  private getHighestQualification(): string {
    if (!this.educationdetails?.length) return '';

    return this.educationdetails[this.educationdetails.length - 1]
      .qualificationName.split('(')[0]
      .trim();
  }

  private getAddingSectionLabel(newId: string): string {
    return (
      this.seleactqualification.find(q => q.value === newId)?.label || ''
    );
  }

  Selectededucation(values: string | string[]) {
    const newId = Array.isArray(values) ? values[0] : values;


    const selected = this.seleactqualification.filter(s =>
      newId.includes(s.value)
    );

    this.selectedQualificationLabel = selected.map(s => s.label).join(', ');

    this.isOtherQualification = this.selectedQualificationLabel.toLowerCase().includes('other');

    // this.isOtherEducation = selected.some(
    //   s => s.label.trim().toLowerCase() === 'other'
    // )

    if (!this.hasProceededOnce) {
      this.previousEducationId = newId;
      this.applyEducationChange(newId);
      return;
    }

    if (!this.previousEducationId) {
      this.previousEducationId = newId;
      this.hasProceededOnce = true;
      this.applyEducationChange(newId);
      return;
    }

    this.basicform.get('qualification')?.updateValueAndValidity();

    if (this.basicform.get('qualification')?.hasError('invalidEducation')) {
      return;
    }


    if (newId === this.previousEducationId) return;


    const currentLabel = this.getAddingSectionLabel(this.previousEducationId);
    const newLabel = this.getAddingSectionLabel(newId);

    if (this.isRemovingQualification(currentLabel, newLabel)) {
      this.showRemovalConfirmationPopup(newId, currentLabel, newLabel);
      return;
    }


    this.showAdditionPopup(newId, newLabel);



    // if (newId !== this.previousEducationId) {

    //   const addingLabel = this.getAddingSectionLabel(newId);

    //   this.msgbox.open({
    //     type: 'warning',
    //     title: 'Are you sure you want to change this?',
    //     mode: 'comparison',
    //     message: `You originally selected ${this.getHighestQualification()} as your last qualification.<br>Adding a ${addingLabel} section will update your highest qualification.`,
    //     okText: 'Yes, Update',
    //     cancelText: 'No',
    //     comparisonData: {
    //       currentSections: this.getCurrentSections(),
    //       addingSection: addingLabel
    //     },


    //     onOk: () => {
    //       this.openPostUpdateInfoPopup(newId, addingLabel);


    //     },
    //     onCancel: () => {
    //       this.basicform.patchValue({
    //         qualification: this.previousEducationId
    //       });
    //     }
    //   });
    // }
    // this.basicform.get('qualification')?.updateValueAndValidity();

  }
  //new education is added (ug-pg)
  private showAdditionPopup(newId: string, addingLabel: string) {
    this.msgbox.open({
      type: 'warning',
      title: 'Are you sure you want to change this?',
      mode: 'comparison',
      message: `
      You originally selected ${this.getHighestQualification()} as your last qualification.<br>
      Adding a <b>${addingLabel}</b> section will update your highest qualification.
    `,
      okText: 'Yes, Update',
      cancelText: 'No',
      showCancel: true,

      comparisonData: {
        currentSections: this.getCurrentSections(),
        addingSection: addingLabel,
        removingSections: ''
      },

      onOk: () => {

        this.openPostUpdateInfoPopup(newId, {
          mode: 'add',
          addingLabel
        });

      },

      onCancel: () => {
        this.basicform.patchValue({
          qualification: this.previousEducationId
        });
      }
    });
  }

//eduction is removed (pg-ug)
  private isRemovingQualification(
    currentLabel: string,
    newLabel: string
  ): boolean {
    const curr = currentLabel.toLowerCase();
    const next = newLabel.toLowerCase();

    if (curr.includes('postgraduate') && next.includes('undergraduate')) return true;
    if (curr.includes('postgraduate') && next.includes('diploma')) return true;
    if (curr.includes('undergraduate') && next.includes('diploma')) return true;

    return false;
  }
  private showRemovalConfirmationPopup(
    newId: string,
    oldLabel: string,
    newLabel: string
  ) {
    this.msgbox.open({
      type: 'warning',
      title: 'Are you sure you want to change this?',
      mode: 'comparison',
      message: `
      You originally selected ${oldLabel}as your last qualification.<br>
      Adding a${newLabel} section will update your highest qualification.`,
      // message: `You have updated your last qualification from
      // <b>${oldLabel}</b> to <b>${newLabel}</b>.<br>
      // As a result, the following sections will be removed.`

      okText: 'Yes, Update',
      cancelText: 'No',

      comparisonData: {
        currentSections: this.getCurrentSections(),
        removingSections: [oldLabel],
        addingSection: ''
      },

      onOk: () => {


        this.openPostUpdateInfoPopup(newId, {
          mode: 'remove',
          removingLabels: [oldLabel]
        });

      },

      onCancel: () => {
        // ✅ rollback selection
        this.basicform.patchValue({
          qualification: this.previousEducationId
        });
      }
    });
  }

  
  //second confirmation popup
  private openPostUpdateInfoPopup1(newId: string, addingLabel: string) {
    this.msgbox.open({
      type: 'warning',
      title: '',
      mode: 'required',
      message: `
      You have updated your selection.<br>
The following sections now need to be filled.
    `,
      okText: 'Proceed',
      cancelText: 'No',
      showCancel: true,

      comparisonData: {
        currentSections: this.getSectionRequiredList(newId),
        addingSection: addingLabel,
        removingSections: ''
      },


      onOk: () => {
        this.previousEducationId = newId;
        this.applyEducationChange(newId);
        this.navigateToFirstEducationStep(newId);
      },

      onCancel: () => {
        this.basicform.patchValue({
          qualification: this.previousEducationId
        });
      }
    });
  }
  private openPostUpdateInfoPopup(
    newId: string,
    options: {
      mode: 'add' | 'remove';
      addingLabel?: string;
      removingLabels?: string[];
    }
  ) {
    const isAdd = options.mode === 'add';

    this.msgbox.open({
      type: 'warning',
      title: '',
      mode: 'required',
      message: `
      You have updated your selection.<br>
      The following sections now need to be filled.
    `,
      okText: 'Proceed',
      cancelText: 'No',
      showCancel: true,

      comparisonData: {
        currentSections: this.getSectionRequiredList(newId),
        addingSection: isAdd ? options.addingLabel : '',
        removingSections: !isAdd ? options.removingLabels : ''
      },

      onOk: () => {
        this.previousEducationId = newId;
        this.applyEducationChange(newId);
        this.navigateToFirstEducationStep(newId);
      },

      onCancel: () => {
        this.basicform.patchValue({
          qualification: this.previousEducationId
        });
      }
    });
  }

  private applyEducationChange(qualificationId: string) {
    this.selectedID = qualificationId;

    this.formSvc.getselectedEducation(qualificationId).subscribe(res => {
      this.educationdetails = res.data ?? res;

      this.stepperService.resetEducationSubSteps();
      this.stepperService.setEducationSubSteps(this.educationdetails);
    });
  }
//after selecting new education start from first
  private navigateToFirstEducationStep(newId: string) {
    const stepKey = this.normalizeQualification(
      this.getAddingSectionLabel(newId)
    );

    this.router.navigate(['/loanform/educationinfo'], {
      queryParams: {
        qualificationlabel: stepKey
      },
      queryParamsHandling: 'merge'
    });
  }

  //check selected qualification on the basis of ug-pg
  qualificationVsCourseTypeValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isUG = localStorage.getItem('coursetypeug') === 'true';

      const label =
        this.getAddingSectionLabel(control.value).toLowerCase();

      //for UG - PG not allowed
      if (isUG) {
        if (
          label.includes('postgraduate (after undergraduate)') ||
          label.includes('postgraduate (after diploma and undergraduate)')
        ) {
          return { invalidEducation: true };
        }
      }
      //for PG - 12th,diploma and others not allowed

      if (!isUG) {
        if (
          label === '10th' ||
          label === '12th' ||
          (label.includes('diploma') && label.includes('10th')) ||
          (label.includes('diploma ') && label.includes('12th')) ||
          label.includes('others')
        ) {
          return { invalidEducation: true };
        }
      }

      return null;
    };
  }

  //label name change here
  normalizeQualification(name: string): string {
    const lower = name.toLowerCase();

    // School
    if (lower === '10th') return '10th';
    if (lower === '12th') return '12th';

    // Diploma
    if (lower.includes('diploma') && lower.includes('10')) return 'diploma10';
    if (lower.includes('diploma') && lower.includes('12')) return 'diploma12';

    if (lower.includes('others') && lower.includes('after 12th')) return 'others12';
    if (lower.includes('others') && lower.includes('diploma')) return 'othersdiploma';

    // UG
    if (lower.includes('undergraduate') || (lower.includes('undergraduate') && lower.includes('after 12th'))) return 'ug';
    // PG
    if ((lower.includes('postgraduate')) || (lower.includes('postgraduate') && lower.includes('undergraduate'))) return 'pg';

    // IELTS / PTE
    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';

    // Offer letter / Others
    if (lower.includes('offer')) return 'offerletter';
    if (lower.includes('others')) return 'others';

    console.warn('Unknown qualification:', name);
    return 'others';
  }

  onEducationSelect(value: any) {
    this.activeEducation = value.label.toLowerCase();
  }

  onChildActivate() {
    this.isChildRouteActive = true;
  }
  get isChildActive(): boolean {
    return !!this.route.firstChild; // child route exists => educationinfo is active
  }

  onChildDeactivate() {
    this.isChildRouteActive = false;
  }


  submit() {

  }
  back() {


    this.stepperService.previous();
  }


  next() {
    if (this.basicform.invalid) return;

    this.hasProceededOnce = true;
    this.previousEducationId = this.basicform.value.qualification;

    const qualificationId = this.basicform.value.qualification;

    let input =

    {
      "applicantId": this.applicantId,
      "lastQualificationId": this.basicform.value.qualification,
      "lastInstitutionId": this.basicform.value.institute
    }

    this.formSvc.selectedqualification(input, this.applicationId).subscribe({
      next: (res) => {
        console.log(res);
        if (res.status == "success") {
          const firstStep = '10th';

          this.router.navigate(['educationinfo'], {
            relativeTo: this.route,
            queryParams: {
              qualificationId: qualificationId,
              applicantId: this.applicantId,
              applicationId: this.applicationId,
              custName: this.custName,
              custARN: this.custARN,
              qualificationlabel: firstStep
            }
          });
        }

      },
      error: (err) => {
        console.error("error msg", err);
      }

    });



  }
}
