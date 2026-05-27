import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Loanstepper } from '../loanstepper/loanstepper';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Main } from '../../../../core/service/main';
import { Coappstepper } from "./coappstepper/coappstepper";
import { LoanformModule } from '../loanform-module';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-coapplicantinfo',
  imports: [CommonModule, Loanstepper, Buttons, FormsModule, ReactiveFormsModule, Inputfield, Coappstepper],
  standalone: true,
  templateUrl: './coapplicantinfo.html',
  styleUrl: './coapplicantinfo.scss'
})
export class Coapplicantinfo implements OnInit {
  applicantId: any;
  applicationId: any;
  custName: any;
  custARN: any;

  searchLoading = false;
  norecord: boolean = false;
  norecordfound: boolean = false;
  isexistinguser: boolean = false

  filteredData: any[] = [];
  mobilenumber: any;
  number_id: any
  prefillPhone: any;

  mobileSubmitted: boolean = false;
  coApplicantIndex: number = 1;

  constructor(public service: Main, private router: Router, private addcustomerservice: Addcustomerservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef, private loanform: Loanformservice, private loanStepper: Loanstepperservice) { }



  ngOnInit() {
    this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];
      this.custName = params['custName'];
      this.custARN = params['custARN'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

      this.coApplicantIndex = Number(params['coApplicantIndex']) || 1;

      this.restoreCoApplicantState();
    });

    if (this.loanform.coappStep === 2) {
      // this.mobileSubmitted = true;
      this.mobileSubmitted = this.loanform.coappStep === 2;

    }

  }

  isPhoneValid(): boolean {
    return this.prefillPhone && this.prefillPhone.toString().length === 10;
  }




  private coApplicantChildRoutes = [
    'co-basicinfo',
    'co-generalinfo',
    'co-additionalinfo',
    'co-kycinfo',
    'co-incomeinfo',
    'co-assetsinfo',
    'co-liabilitiesinfo',
    'co-monthlyexpinfo',
    'co-summaryinfo'
  ];
  //on refresh page redirecting to number page so storing here 
  restoreCoApplicantState() {
    const cleanUrl = this.router.url.split('?')[0];

    const isStepperRoute = this.coApplicantChildRoutes.some(route =>
      cleanUrl.includes(route)
    );

    if (isStepperRoute) {
      this.mobileSubmitted = true;
      return;
    }

    const saved = localStorage.getItem(`coapp_mobile_submitted_${this.applicantId}_${this.coApplicantIndex}`);
    // this.mobileSubmitted = saved === 'true';
  }
  getPhoneFieldState(phone: any): 'default' | 'error' | 'success' {
    if (phone.touched && phone.invalid) {
      return 'error';
    }
    if (this.norecordfound && phone.valid) {
      return 'error';
    }

    return 'default';
  }
  back() { }

  saveCoApplicantToList(userid: any) {
  const key = `coApplicants_${this.applicantId}`;

  const saved = localStorage.getItem(key);
  let coApplicants = saved ? JSON.parse(saved) : [];

  const existingIndex = coApplicants.findIndex(
    (x: any) => Number(x.index) === Number(this.coApplicantIndex)
  );

  const data = {
    index: this.coApplicantIndex,
    userInitiateId: userid,
    phone: this.prefillPhone,
    name: '',
    status: 'IN_PROGRESS'
  };

  if (existingIndex > -1) {
    coApplicants[existingIndex] = {
      ...coApplicants[existingIndex],
      ...data
    };
  } else {
    coApplicants.push(data);
  }

  coApplicants = coApplicants
    .sort((a: any, b: any) => Number(a.index) - Number(b.index))
    .slice(0, 4);

  localStorage.setItem(key, JSON.stringify(coApplicants));
}

  next() {
    if (!this.isPhoneValid() || this.searchLoading) return;

    this.searchLoading = true;
    this.norecordfound = false;
    this.loanform.coapppmobile = this.prefillPhone;
    this.loanform.coappStep = 2;
    this.mobileSubmitted = true;

    localStorage.setItem(

      `coapp_mobile_submitted_${this.applicantId}_${this.coApplicantIndex}`,
      'true'

    );

    const input = {
      identifier: this.prefillPhone,
      type: "MOBILE",
      isSearch: false,
      applicantType: "CO_APPLICANT",
      coApplicantIndex: this.coApplicantIndex,
      applicationId: this.applicationId
    };

    this.addcustomerservice.customersearch(input).subscribe({

      next: (res) => {
        console.log(res);
        const userid = res.data.userInitiateId
        this.saveCoApplicantToList(userid);
        this.loanStepper.setStepperType('CO_APPLICANT');

        this.router.navigate(
          ['co-basicinfo'],
          {
            relativeTo: this.route,
            queryParams: {
              applicantId: this.applicantId,
              applicationId: this.applicationId,
              custName: this.custName,
              custARN: this.custARN,
              id: userid,
              phone: this.prefillPhone,
              coApplicantIndex: this.coApplicantIndex
            },
            queryParamsHandling: 'merge'
          }
        );

        this.searchLoading = false;
      },
      error: (err) => {
        console.error("error msg", err);
        this.searchLoading = false;
        this.norecordfound = true;
      }
    });
  }

}
