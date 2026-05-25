import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Radiobuttons } from '../../../systemdesign/radiobuttons/radiobuttons';
import { Datepickernew } from '../../../systemdesign/datepickernew/datepickernew';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { generalerrors } from './generalerror'
interface OptionItem {
  label: string;
  value: string;
  code?: string;
}

@Component({
  selector: 'app-general-info',
  imports: [CommonModule, Inputfield, Dropdown, Buttons, Radiobuttons, Datepickernew, ReactiveFormsModule],
  standalone: true,
  templateUrl: './general-info.html',
  styleUrl: './general-info.scss'
})
export class GeneralInfo implements OnInit {

  allerrors = generalerrors;
  currenterror = ''

  openIndex: number | null = 0;
  accordions = [
    { title: 'General Info ', alwaysOpen: true },

  ];

  registerForm!: FormGroup;
  checkyes_rb = "option1"


  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  formData: any = {};

  occupationlabel: string = 'Current Occupation';
  selectoccupation: OptionItem[] = [];


  qualification: string = 'Last Qualification';
  seleactqualification: OptionItem[] = []

  state: string = 'State';

  university: string = 'University Name';
  selectuniversity: OptionItem[] = []

  coursetype: string = 'Course Type';
  selectcourse: OptionItem[] = []
  coursetypeId: any;

  coursename: string = 'Course Name';
  selectcoursename: OptionItem[] = []


  courseduration: string = 'Course Duration';
  selectcourseduration: DropdownOption[] = [
    { label: '1 Year', value: '1 Year', icon: '' },
    { label: '2 Years', value: '2 Years', icon: '' },
    { label: '3 Years', value: '3 Years', icon: '' },
    { label: '4 Years', value: '4 Years', icon: '' },
    { label: '4+ Years', value: '4+ Years', icon: '' },
  ]
  lendingpartner: string = 'Lending Partner';
  selectlendingpartner: OptionItem[] = []

  checkboxasset: any;


  Australianstate: OptionItem[] = [];
  AustralianUniversities: OptionItem[] = [];

  selectedStateLabel: string = '';
  selectedUniLabel: string = '';
  selectedcoursetypeLabel: string = '';
  selectedcourseNameLabel: string = '';


  applicantId: string = '';
  applicationId: string = '';
  custName: string = '';
  custARN: string = '';

  calculatedEndDate!: Date;


  statesLoaded = false;


  isOtherstate = false;
  isOtherUniversity = false;
  isOthercoursetype = false;
  isOthercoursename = false;

  //coapplicant 
  isCoApplicant: boolean = false;
  coapp_registerForm!: FormGroup;

  selectAnnualIncome: DropdownOption[] = [
    { label: '0-5 Lakhs', value: '0-5 Lakhs', icon: '' },
    { label: '5-10 Lakhs', value: '5-10 Lakhs', icon: '' },
    { label: '10-20 Lakhs', value: '10-20 Lakhs', icon: '' },
    { label: '20-30 Lakhs', value: '20-30 Lakhs', icon: '' },
    { label: '30-40 Lakhs', value: '30-40 Lakhs', icon: '' },
    { label: '40-50 Lakhs', value: '40-50 Lakhs', icon: '' },
    { label: '50-75 Lakhs', value: '50-75 Lakhs', icon: '' },
    { label: '75 Lakhs - 1 Crore', value: '75 Lakhs - 1 Crore', icon: '' },
    { label: '1 Crore & Above', value: '1 Crore & Above', icon: '' },
    { label: 'No Income', value: 'No Income', icon: '' },

  ]


  constructor(private fb: FormBuilder, private formSvc: Loanformservice, private router: Router, private stepperService: Loanstepperservice, private route: ActivatedRoute, public mainservice: Main) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];
        this.custName = params['custName'];
        this.custARN = params['custARN'];

        this.stepperService.setLoanId(this.applicantId, this.applicationId, this.custName, this.custARN);
      }
    });
    this.isCoApplicant = this.router.url.includes('co-applicant');


    const currentUserKey = 'currentApplicantId';
    const previousId = localStorage.getItem(currentUserKey);

    if (previousId && previousId !== this.applicantId) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_')) {
          localStorage.removeItem(key);
        }
      });
    }

    localStorage.setItem(currentUserKey, this.applicantId);


    this.stepperService.rebuildSteps();

    this.registerForm = this.fb.group({

      occupation: ['', Validators.required],
      // qualification: ['', Validators.required],
      // institutionName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      state: ['', Validators.required],
      otherstatetitle: [''],
      university: ['', Validators.required],
      otherunititle: [''],
      coursetype: ['', Validators.required],
      othercoursetypetitle: [''],
      coursename: ['', Validators.required],
      othercoursenametitle: [''],
      // courseduration: [''],
      coursestartdate: ['', [Validators.required, this.dateMinValidator(() => new Date())]],
      courseenddate: ['', [Validators.required, this.endDateValidator()]],
      checkedasset: [false, Validators.required],
      lendingpartner: ['', Validators.required],


    });


    this.coapp_registerForm = this.fb.group({

      occupation: ['', Validators.required],
      annualincome: ['', Validators.required],
      relationship: ['', Validators.required],
      checkedasset: [false, Validators.required],
    });

    this.getOccupationdetails();
    if (!this.isCoApplicant) {
      this.states();
      this.getEducationdetails();
      this.getlendingpartnersdetails();
    }
    this.registerForm.get('coursestartdate')?.valueChanges.subscribe((startDate) => {

      if (!startDate) return;

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      this.calculatedEndDate = start;
      const endCtrl = this.registerForm.get('courseenddate');
      endCtrl?.reset();
      endCtrl?.updateValueAndValidity();

    });


    const key = this.isCoApplicant
      ? `generalInfo_coapp_${this.applicantId}`
      : `generalInfo_main_${this.applicantId}`;

    const storedData = localStorage.getItem(key);
    let parsed: any = null;
    if (storedData) {
      parsed = JSON.parse(storedData);


      if (!parsed.currentOccupationId) {
        parsed = {
          ...parsed,
          currentOccupationId: parsed.occupation,
          stateId: parsed.state,
          universityId: parsed.university,
          courseId: parsed.coursename,
          hasAssets: parsed.checkedasset === 'Yes',

        };
      }


      if (this.isCoApplicant) {
        // this.coapp_registerForm.patchValue(parsed);
        this.coapp_registerForm.patchValue({

          occupation: parsed.currentOccupationId,
          checkedasset: parsed.hasAssets ? 'Yes' : 'No',
        });
      } else {
        // this.registerForm.patchValue(parsed);

        this.registerForm.patchValue({

          occupation: parsed.currentOccupationId,
          checkedasset: parsed.hasAssets ? 'Yes' : 'No',
          coursestartdate: this.parseDate(parsed.courseStartDate),
          courseenddate: this.parseDate(parsed.courseEndDate),
          lendingpartner: parsed.lendingPartnerId

        });

        this.registerForm.get('checkedasset')?.setValue(parsed.hasAssets ? 'Yes' : 'No');

        this.restoreDependentDropdowns(parsed); // ✅ this handles university/courses
      }

      this.checkboxasset = parsed.hasAssets ? "Yes" : "No";

    }





    // this.registerForm.get('checkedasset')?.valueChanges.subscribe(value => {
    //   console.log('Selected:', value);
    //   this.checkassetOnChange(value);
    // });
    this.activeForm.get('checkedasset')?.valueChanges.subscribe(value => {
      this.checkassetOnChange(value);
    });



    // let data = this.formSvc.generalInfoData || parsed;

    // if (this.formSvc.generalInfoData && !this.isCoApplicant) {

    //   this.registerForm.patchValue({
    //     checkedasset: this.formSvc.generalInfoData.hasAssets ? 'Yes' : 'No'
    //   });


    //   this.registerForm.patchValue({
    //     occupation: this.formSvc.generalInfoData.currentOccupationId,
    //     state: this.formSvc.generalInfoData.stateId,
    //     otherstatetitle: this.formSvc.generalInfoData.otherStateName,
    //     university: this.formSvc.generalInfoData.universityId,
    //     otherunititle: this.formSvc.generalInfoData.otherUniversityName,
    //     coursename: this.formSvc.generalInfoData.courseId,
    //     othercoursenametitle: this.formSvc.generalInfoData.otherCourseName,
    //     coursetype: this.formSvc.generalInfoData.coursetype,
    //     othercoursetypetitle: this.formSvc.generalInfoData.othercoursetypetitle ? this.formSvc.generalInfoData.othercoursetypetitle : '',

    //     coursestartdate: this.parseDate(data.courseStartDate),
    //     courseenddate: this.parseDate(data.courseEndDate),
    //     lendingpartner: this.formSvc.generalInfoData.lendingPartnerId
    //   });

    //   this.checkboxasset = this.formSvc.generalInfoData.hasAssets ? "Yes" : "No";

    //   this.restoreDependentDropdowns(this.formSvc.generalInfoData);
    // }



  }
  get activeForm(): FormGroup {
    return this.isCoApplicant ? this.coapp_registerForm : this.registerForm;
  }

  private restoreDependentDropdowns(data: any) {
    if (!data?.stateId) return;

    this.registerForm.patchValue({
      state: data.stateId,
      otherstatetitle: data.otherStateName ?? ''
    });
    this.selectPerState(data.stateId);


    const found = this.Australianstate.find(s => s.value === data.stateId);
    this.isOtherstate = found?.label?.toLowerCase().includes('other') ?? false;;

    this.formSvc.getAustralianstatescities(data.stateId).subscribe(res => {
      this.AustralianUniversities = res.data.map((u: any) => ({
        value: u.id,
        label: u.universityName
      }));

      this.registerForm.patchValue({ university: data.universityId });
      this.selecteduniversity(data.universityId);

      this.formSvc.getCoursetype(data.universityId).subscribe(ct => {
        this.selectcourse = ct.data.map((c: string) => ({
          label: c,
          value: c
        }));

        this.registerForm.patchValue({ coursetype: data.coursetype });
        this.selectedcoursetype(data.coursetype);

        this.formSvc.getCourseName(data.universityId, data.coursetype).subscribe(cn => {
          this.selectcoursename = cn.data.map((c: any) => ({
            value: c.id,
            label: c.courseName
          }));

          this.registerForm.patchValue({ coursename: data.courseId });
          this.selectedCoursename(data.courseId);
        });
      });
    });
  }

  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');

    if (parts.length !== 3) return null;

    const [day, month, year] = parts;

    return new Date(+year, +month - 1, +day);
  }
  get form() {
    return this.formSvc.form.get('loanInfo') as FormGroup;
  }

  onSelectionChange(selectedkey: string, value: string) {
    this.formData[selectedkey] = value;
    console.log('Changed:', selectedkey, value);
  }

  toggle(i: number) {
    this.openIndex = this.openIndex === i ? null : i;
  }

  submit() {
    if (this.registerForm.invalid) return;

    console.log(this.registerForm.value);
  }

  checkassetOnChange(event: any) {
    this.checkboxasset = event;
    if (this.checkboxasset === 'Yes') {
      this.formSvc.isasset = true;
      localStorage.setItem('isasset', JSON.stringify(this.formSvc.isasset));
      this.stepperService.rebuildSteps();

      this.stepperService.setvalues(
        this.formSvc.isasset,
        this.formSvc.isincome,
        this.formSvc.issalaried
      );
    } else {
      this.formSvc.isasset = false;
      localStorage.setItem('isasset', JSON.stringify(this.formSvc.isasset));
      this.stepperService.rebuildSteps();
      this.stepperService.setvalues(this.formSvc.isasset, this.formSvc.isincome, this.formSvc.issalaried);
    }

    console.log(event);
  }
  get f() {
    return this.registerForm.controls;
  }

  getOccupationdetails() {
    this.formSvc.getOccupations().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectoccupation = list.map((s: any) => ({
        value: s.occupationId,
        label: s.occupationName,

      }));
    });
    setTimeout(() => {
      let data = this.registerForm.get('occupation')?.valueChanges.subscribe(value => {
        const selected = this.selectoccupation.find(o => o.value === value);
        // this.occupationlabel = selected ? selected.label : 'Current Occupation';
        this.formSvc.isincome = selected?.label === 'Employed' ? true : selected?.label === 'Self-employed' ? true : false;
        console.log('Selected Occupation:', this.formSvc.isincome);
        this.formSvc.issalaried = selected?.label === 'Employed' ? true : false;
        this.stepperService.rebuildSteps();

        this.stepperService.setvalues(
          this.formSvc.isasset, this.formSvc.isincome, this.formSvc.issalaried
        );

      });
    }, 1000);


    // console.log(data);

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

  getlendingpartnersdetails() {
    this.formSvc.getlendingpartners().subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectlendingpartner = list.map((s: any) => ({
        value: s.partnerId,
        label: s.partnerName,
        code: s.partnerCode
      }));
    });
  }

  restoreDropdownLabels(data: any) {

    const occ = this.selectoccupation.find(o => o.value == data.occupation);
    this.occupationlabel = occ?.label || 'Current Occupation';

    const qual = this.seleactqualification.find(q => q.value == data.qualification);
    this.qualification = qual?.label || 'Last Qualification';

    const state = this.Australianstate.find(s => s.value == data.state);
    this.selectedStateLabel = state?.label || '';

    const uni = this.AustralianUniversities.find(u => u.value == data.university);
    this.selectedUniLabel = uni?.label || '';

    const courseType = this.selectcourse.find(c => c.value == data.coursetype);
    this.selectedcoursetypeLabel = courseType?.label || '';

    const courseName = this.selectcoursename.find(c => c.value == data.coursename);
    this.selectedcourseNameLabel = courseName?.label || '';

  }

  //australian state and universities
  states() {
    this.formSvc.getAustralianstates().subscribe((res: any) => {
      const list = res.data ?? res;

      this.Australianstate = list.map((s: any) => ({
        value: s.id,
        label: s.stateName,
        code: s.stateCode
      }));

      this.statesLoaded = true;

      if (this.formSvc.generalInfoData) {

        const data = this.formSvc.generalInfoData;


        setTimeout(() => {
          this.registerForm.patchValue({
            state: data.stateId
          });



          this.selectPerState(data.stateId, true);
        });


        // this.restoreDependentDropdowns(this.formSvc.generalInfoData);
      }


    });
  }

  selectPerState(id: any, isRestore: boolean = false) {

    const found = this.Australianstate.find(s => s.value === id);
    this.selectedStateLabel = found?.label ?? '';
    this.isOtherstate = this.selectedStateLabel.toLowerCase().includes('other');

    if (!isRestore) {
      this.AustralianUniversities = [];
      this.selectedUniLabel = '';
      this.registerForm.get('university')?.setValue(null);

      this.selectcourse = [];
      this.selectedcoursetypeLabel = '';
      this.registerForm.get('coursetype')?.setValue(null);

      this.selectcoursename = [];
      this.selectedcourseNameLabel = '';
      this.registerForm.get('coursename')?.setValue(null);
    }
    this.selectuniveristy(id);
  }

  selectuniveristy(id: any) {
    this.formSvc.getAustralianstatescities(id).subscribe((res: any) => {
      const list = res.data ?? res;

      this.AustralianUniversities = list.map((c: any) => ({
        value: c.id,
        label: c.universityName,
        code: c.universityCode
      }));
    });
  }

  selecteduniversity(id: any) {

    const found = this.AustralianUniversities.find(s => s.value === id);
    this.selectedUniLabel = found?.label ?? '';

    this.isOtherUniversity = this.selectedUniLabel.toLowerCase().includes('other');


    this.selectcourse = [];
    this.selectedcoursetypeLabel = '';
    this.registerForm.get('coursetype')?.setValue(null);

    this.selectcoursename = [];
    this.selectedcourseNameLabel = '';
    this.registerForm.get('coursename')?.setValue(null);

    this.selectCourseType(id);
  }


  selectCourseType(id: any) {
    this.coursetypeId = id;
    this.formSvc.getCoursetype(id).subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectcourse = list.map((course: string) => ({
        label: course,
        value: course
      }));


      const savedType = this.formSvc.generalInfoData?.coursetype;
      if (savedType) {
        this.registerForm.patchValue({ coursetype: savedType });
        this.selectedcoursetype(savedType);
      }


    });
  }
  selectedcoursetype(id: any) {

    const found = this.selectcourse.find(s => s.value === id);
    this.selectedcoursetypeLabel = found?.label ?? '';
    this.isOthercoursetype = this.selectedcoursetypeLabel.toLowerCase().includes('other');
    this.formSvc.coursetypeug = this.selectedcoursetypeLabel.includes('UG') ? true : false;

    localStorage.setItem(
      'coursetypeug',
      JSON.stringify(this.formSvc.coursetypeug)
    );

    this.stepperService.setvalues(
      this.formSvc.isasset, this.formSvc.isincome, this.formSvc.issalaried, this.formSvc.coursetypeug
    );

    this.selectcoursename = [];
    this.selectedcourseNameLabel = '';
    this.registerForm.get('coursename')?.setValue(null);

    this.select_CourseName(this.coursetypeId, id);
  }


  select_CourseName(id: string, name: string) {
    this.formSvc.getCourseName(id, name).subscribe((res: any) => {
      const list = res.data ?? res;

      this.selectcoursename = list.map((c: any) => ({
        value: c.id,
        label: c.courseName,
        code: c.courseCode
      }));

      const savedCourseId = this.formSvc.generalInfoData?.courseId;
      if (savedCourseId) {
        this.registerForm.patchValue({ coursename: savedCourseId });
        this.selectedCoursename(savedCourseId);
      }

    });
  }

  selectedCoursename(id: any) {

    const found = this.selectcoursename.find(s => s.value === id);
    this.selectedcourseNameLabel = found?.label ?? '';
    this.isOthercoursename = this.selectedcourseNameLabel.toLowerCase().includes('other');


    // this.selectcourse = [];
    // this.selectCourseType(id);
  }

  calculateEndDate() {
    const startDate = this.registerForm.get('coursestartdate')?.value;
    const duration = this.registerForm.get('courseduration')?.value;

    if (!startDate || !duration) return;

    if (duration.includes('4+')) {
      this.registerForm.patchValue(
        { courseenddate: null },
        { emitEvent: false }
      );
      this.registerForm.get('courseenddate')?.updateValueAndValidity();
      return;
    }

    const years = parseInt(duration);
    if (isNaN(years)) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + years);

    this.calculatedEndDate = end;

    this.registerForm.patchValue(
      { courseenddate: end },
      { emitEvent: false }
    );
    this.registerForm.get('courseenddate')?.updateValueAndValidity();

  }

  dateMinValidator = (getMinDate: () => Date) => {
    return (control: any) => {
      const value = control.value;
      const minDate = getMinDate();

      if (!value || !minDate) return null;

      const selected = new Date(value);
      const min = new Date(getMinDate());


      selected.setHours(0, 0, 0, 0);
      min.setHours(0, 0, 0, 0);

      return selected < min ? { minDateError: true } : null;
      // if (selected < min) {
      //   return { minDateError: true };
      // }

      // return null;
    };
  };

  endDateValidator = () => {
    return (control: any) => {
      const endDate = control.value;
      const minDate = this.calculatedEndDate;

      if (!endDate || !minDate) return null;

      const end = new Date(endDate);
      const min = new Date(minDate);


      end.setHours(0, 0, 0, 0);
      min.setHours(0, 0, 0, 0);
      return end <= min ? { invalidEndDate: true } : null;

    };
  };

  formatDate(date: any): string | null {
    if (!date) return null;

    // If Moment
    if (date._isAMomentObject) {
      return date.format('DD/MM/YYYY');
    }

    // If JS Date
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    return null;
  }
  back() {
    this.stepperService.previous();
  }

  //main applicant data
  saveMainApplicant(formdata: any) {
    let input = {
      "applicationId": this.applicationId,
      "applicantId": this.applicantId,
      "currentOccupationId": formdata.occupation,
      "stateId": formdata.state,
      "otherStateName": formdata.otherstatetitle,
      "universityId": formdata.university,
      "otherUniversityName": formdata.otherunititle,
      "courseId": formdata.coursename,
      "otherCourseName": formdata.othercoursenametitle,
      "courseStartDate": this.formatDate(formdata.coursestartdate),
      "courseEndDate": this.formatDate(formdata.courseenddate),
      "hasAssets": this.checkboxasset == "Yes" ? true : false,
      "lendingPartnerId": formdata.lendingpartner,
    }

    this.formSvc.submitGenralInfo(input, this.applicationId).subscribe(res => {
      if (res.status === "success") {


        this.stepperService.next();

        this.formSvc.generalInfoData = { ...input, coursetype: formdata.coursetype };
        const key = `generalInfoData_${this.applicantId}`;
        localStorage.setItem(
          `generalInfo_main_${this.applicantId}`,
          JSON.stringify(this.formSvc.generalInfoData)
        );

        this.stepperService.markStepCompleted('genralinfo');
        this.stepperService.setStepData('genralinfo', formdata);

      }
    });
  }

  //coapplicant data

  saveCoApplicant(formdata: any) {
    const input = {
      applicationId: this.applicationId,
      applicantId: this.applicantId,
      occupation: formdata.occupation,
      annualIncome: formdata.annualincome,
      relationship: formdata.relationship,
      hasAssets: this.checkboxasset === "Yes",
    };

    // Call separate API if required
    console.log("Co-Applicant Data:", input);



    this.stepperService.next();
    this.formSvc.co_generalInfoData = { ...input, coursetype: formdata.coursetype };
    const key = `generalInfoData_${this.applicantId}`;
    localStorage.setItem(
      `generalInfo_coapp_${this.applicantId}`,
      JSON.stringify(this.formSvc.co_generalInfoData)
    );

    // this.stepperService.markStepCompleted('genralinfo');
    // this.stepperService.setStepData('genralinfo', formdata);



  }

  next() {
    const form = this.activeForm;

    if (!form.valid) {
      console.log("form invalid");
      return;
    }

    if (this.isCoApplicant) {
      this.saveCoApplicant(form.value);
    } else {
      this.saveMainApplicant(form.value);
    }
  }

  next1() {
    if (!this.registerForm.valid) {
      console.log("form invalid");
      return;
    }

    let formdata = this.registerForm.value;
    console.log("formdata------", formdata);
    let input = {
      "applicationId": this.applicationId,
      "applicantId": this.applicantId,

      "currentOccupationId": formdata.occupation,
      // "lastQualificationId": formdata.qualification,
      // "lastInstitutionName": formdata.institutionName,

      "stateId": formdata.state,
      "otherStateName": formdata.otherstatetitle,
      "universityId": formdata.university,
      "otherUniversityName": formdata.otherunititle,
      "courseId": formdata.coursename,
      "otherCourseName": formdata.othercoursenametitle,
      // "courseDuration": formdata.courseduration,
      "courseStartDate": this.formatDate(formdata.coursestartdate),

      "courseEndDate": this.formatDate(formdata.courseenddate),

      "hasAssets": this.checkboxasset == "Yes" ? true : false,
      "lendingPartnerId": formdata.lendingpartner,
    }

    console.log(input);
    this.formSvc.submitGenralInfo(input, this.applicationId).pipe().subscribe({
      next: (res) => {

        if (res.status == "success") {

          this.stepperService.next();
          // this.formSvc.generalInfoData = input;
          this.formSvc.generalInfoData = { ...input, coursetype: formdata.coursetype };
          const key = `generalInfoData_${this.applicantId}`;
          localStorage.setItem(
            key,
            JSON.stringify(this.formSvc.generalInfoData)
          );

          this.stepperService.markStepCompleted('genralinfo');
          this.stepperService.setStepData('genralinfo', formdata);


        }

      },
      error: (err) => {
        console.error("error msg", err);
      }

    });



  }

}
