import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  educationdetails: any;
  qualificationId!: string;

  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';

  activeEducation!: '10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg';

  educationOrder: Array<'10th' | '12th' | 'diploma10' | 'diploma12' | 'ug' | 'pg'> = ['10th', '12th', 'diploma10', 'diploma12', 'ug', 'pg'];

  educationForms: any = {};
  isChildRouteActive = false;

  isOtherQualification = false;
  isOtherEducation = false;

  basicform!: FormGroup;


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

    this.basicform = this.fb.group({
      qualification: ['', Validators.required],
      qualificationtitle: [''],
      institute: ['', Validators.required],
      institutetitle: ['']
    })
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



  Selectededucation1(values: string | string[]) {
    const ids = Array.isArray(values) ? values : [values];

    const selected = this.seleactqualification.filter(s =>
      ids.includes(s.value)
    );

    this.selectedLabel = selected.map(s => s.label).join(', ');
    this.selectedID = selected.map(s => s.value).join(', ');
    this.isOtherQualification = this.selectedLabel.toLowerCase().includes('other');

    this.formSvc.getselectedEducation(this.selectedID).subscribe((res: any) => {
      this.educationdetails = res.data ?? res;

      this.stepperService.setEducationSubSteps(this.educationdetails);

      this.educationOrder = this.educationdetails.map((d: any) =>
        this.normalizeQualification(d.qualificationName)
      );
      console.log(this.educationOrder);


    });
  }
  private getCurrentSections(): string[] {
    if (!this.educationdetails) return [];

    const sections = this.educationdetails.map((d: any) =>
      d.qualificationName.includes('Others')
        ? d.qualificationName
        : d.qualificationName.split('(')[0].trim()
    );

    sections.push("IELTS / PTE")
    sections.push("University Offer Letter")
    return sections;
  }

  private getSectionRequiredList(newId: string): string[] {
    const academic = this.getCurrentSections();

    const filteredAcademic = academic.filter(
      sec => sec !== 'IELTS / PTE' && sec !== 'University Offer Letter'
    );

    const adding = this.getAddingSectionLabel(newId);

    const result: string[] = [];


    filteredAcademic.forEach(sec => {
      if (!result.includes(sec)) {
        result.push(sec);
      }
    });


    if (adding && !result.includes(adding)) {
      result.push(adding);
    }

    // ✅ ALWAYS LAST
    result.push('IELTS / PTE');
    result.push('University Offer Letter');

    return result;
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

    if (!this.previousEducationId) {
      this.previousEducationId = newId;
      this.applyEducationChange(newId);
      return;
    }

    if (newId !== this.previousEducationId) {

      const addingLabel = this.getAddingSectionLabel(newId);

      this.msgbox.open({
        type: 'warning',
        title: 'Are you sure you want to change this?',
        mode: 'comparison',
        message: `You originally selected ${this.getHighestQualification()} as your last qualification.<br>Adding a ${addingLabel} section will update your highest qualification.`,
        okText: 'Yes, Update',
        cancelText: 'No',
        comparisonData: {
          currentSections: this.getCurrentSections(),
          addingSection: addingLabel
        },


        onOk: () => {
          this.openPostUpdateInfoPopup(newId, addingLabel);


        },
        onCancel: () => {
          this.basicform.patchValue({
            qualification: this.previousEducationId
          });
        }
      });
    }
  }

  private openPostUpdateInfoPopup(newId: string, addingLabel: string) {
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
        addingSection: addingLabel
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

      // reset flow (VERY IMPORTANT)
      this.stepperService.resetEducationSubSteps();

      this.stepperService.setEducationSubSteps(this.educationdetails);
    });
  }
  private getRequiredSectionsAfterChange(newId: string): string[] {
    const label = this.getAddingSectionLabel(newId).toLowerCase();

    const base = ['10th std', '12th std'];

    if (label.includes('diploma')) {
      return [...base, 'Diploma'];
    }

    if (label.includes('undergraduate')) {
      return [...base, 'Undergraduate'];
    }

    if (label.includes('postgraduate')) {
      return [...base, 'Postgraduate'];
    }

    return base;
  }
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
    if (lower.includes('undergraduate')) return 'ug';
    // PG
    if (lower.includes('postgraduate') && lower.includes('undergraduate')) return 'pg';

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
  isOtherInstitute(fd: AbstractControl): boolean {
    const selectedId = fd.get('qualification')?.value;
    const found = this.seleactInstitute.find(b => b.value === selectedId);
    return found?.label === 'Other';
  }
  submit() {

  }
  back() {


    this.stepperService.previous();
  }


  next() {
    if (this.basicform.invalid) return;

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
          this.router.navigate(['educationinfo'], {
            relativeTo: this.route,
            queryParams: {
              qualificationId: qualificationId,
              applicantId: this.applicantId,
              applicationId: this.applicationId,
              custName: this.custName,
              custARN: this.custARN,
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
