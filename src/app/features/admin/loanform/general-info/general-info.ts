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
import {generalerrors} from './generalerror'
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

 allerrors=generalerrors;
 currenterror =''
 
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
  constructor(private fb: FormBuilder, private formSvc: Loanformservice, private router: Router, private stepperService: Loanstepperservice, private route: ActivatedRoute,) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicantId = params['applicantId'];
        this.applicationId = params['applicationId'];
       this.custName = params['custName'];
        this.custARN = params['custARN'];

        this.stepperService.setLoanId(this.applicantId, this.applicationId,this.custName,this.custARN);
      }
    });


    this.states();
    this.getOccupationdetails();
    this.getEducationdetails();
    this.getlendingpartnersdetails();
    this.registerForm = this.fb.group({

      occupation: ['', Validators.required],
      qualification: ['', Validators.required],
      institutionName: ['', [Validators.required, Validators.pattern('^[A-Za-z ]+$'),Validators.minLength(2), Validators.maxLength(100)]],
      state: ['', Validators.required],
      university: ['', Validators.required],
      coursetype: ['', Validators.required],
      coursename: ['', Validators.required],
      courseduration: ['', Validators.required],
      coursestartdate: ['', Validators.required],
      courseenddate: ['', Validators.required],
      checkedasset: [false, Validators.required],
      lendingpartner: ['', Validators.required],


    });
    this.registerForm.get('coursestartdate')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.registerForm.get('courseduration')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });
    this.registerForm.get('checkedasset')?.valueChanges.subscribe(value => {
      console.log('Selected:', value);
      this.checkassetOnChange(value);
    });

    // const savedData = this.stepperService.getStepData('genralinfo');

    // if (savedData) {
    //   this.registerForm.patchValue(savedData);
      // this.restoreDropdownLabels(savedData);

    // }
  }

  get form() {
    return this.formSvc.form.get('loanInfo') as FormGroup;
  }

  saveDraft() {

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
      // this.restoreDropdownLabels(this.registerForm.value);
    });
  }

  getEducationdetails() {
    this.formSvc.getEducation().subscribe((res: any) => {
      const list = res.data ?? res;

      this.seleactqualification = list.map((s: any) => ({
        value: s.qualificationId,
        label: s.qualificationName,

      }));
      // this.restoreDropdownLabels(this.registerForm.value);
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
      // this.restoreDropdownLabels(this.registerForm.value);
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
      // this.restoreDropdownLabels(this.registerForm.value);
    });
  }

  selectPerState(id: any) {

    const found = this.Australianstate.find(s => s.value === id);
    this.selectedStateLabel = found?.label ?? '';
    this.AustralianUniversities = [];
    this.selectedUniLabel = '';
    this.registerForm.get('university')?.setValue(null);

    this.selectcourse = [];
    this.selectedcoursetypeLabel='';
    this.registerForm.get('coursetype')?.setValue(null);

    this.selectcoursename = [];
    this.selectedcourseNameLabel = '';
    this.registerForm.get('coursename')?.setValue(null);
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
      // this.restoreDropdownLabels(this.registerForm.value);
    });
  }

  selecteduniversity(id: any) {

    const found = this.AustralianUniversities.find(s => s.value === id);
    this.selectedUniLabel = found?.label ?? '';

    this.selectcourse = [];
    this.selectedcoursetypeLabel='';
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
      // this.restoreDropdownLabels(this.registerForm.value);
    });
  }
  selectedcoursetype(id: any) {

    const found = this.selectcourse.find(s => s.value === id);
    this.selectedcoursetypeLabel = found?.label ?? '';
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
      // this.restoreDropdownLabels(this.registerForm.value);
    });
  }

  selectedCoursename(id: any) {

    const found = this.selectcoursename.find(s => s.value === id);
    this.selectedcourseNameLabel = found?.label ?? '';
    // this.selectcourse = [];
    // this.selectCourseType(id);
  }

  calculateEndDate() {
    const startDate = this.registerForm.get('coursestartdate')?.value;
    const duration = this.registerForm.get('courseduration')?.value;

    if (!startDate || !duration) return;

    const years = parseInt(duration);
    if (isNaN(years)) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + years);

    this.registerForm.patchValue(
      { courseenddate: end },
      { emitEvent: false }
    );

    if (duration.includes('4+')) {
      this.registerForm.patchValue(
        { courseenddate: null },
        { emitEvent: false }
      );
      return;
    }
  }

  formatDate(date: any): string | null {
    if (!date) return null;

    // If Moment
    if (date._isAMomentObject) {
      return date.format('YYYY-MM-DD');
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
  next1() { this.stepperService.next(); }
  next() {
    if (!this.registerForm.valid) {
      console.log("form invalid");
      return;
    }

    let formdata = this.registerForm.value;

    let input = {
      "applicationId": this.applicationId,
      "applicantId": this.applicantId,

      "currentOccupationId": formdata.occupation,
      "lastQualificationId": formdata.qualification,
      "lastInstitutionName": formdata.institutionName,

      "stateId": formdata.state,
      "universityId": formdata.university,
      "courseId": formdata.coursename,
      "courseDuration": formdata.courseduration,
      "courseStartDate": this.formatDate(formdata.coursestartdate),

      "courseEndDate": this.formatDate(formdata.courseenddate),

      "hasAssets": this.checkboxasset == "Yes" ? true : false,
      "lendingPartnerId": formdata.lendingpartner,
    }

    console.log(input);
    this.formSvc.submitGenralInfo(input, this.applicationId).pipe().subscribe({
      next: (res) => {
        console.log("resp---", res);
        if (res.status == "success") {

          this.stepperService.next();
          this.stepperService.setStepData('genralinfo', formdata);
       
          console.log("resp---", this.registerForm.value);
        }

      },
      error: (err) => {
        console.error("error msg", err);
      }

    });



  }

}
