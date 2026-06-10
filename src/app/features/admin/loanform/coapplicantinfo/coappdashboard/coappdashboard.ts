import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Button } from 'bootstrap';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Addcustomerservice } from '../../../../../core/service/addcustomerservice';
import { Main } from '../../../../../core/service/main';
import { TableData } from '../../../../../core/service/table-data';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';
import { Loanformservice } from '../../../../../core/service/loanformservice';
import { Msgboxservice } from '../../../../../core/service/msgboxservice';

@Component({
  selector: 'app-coappdashboard',
  imports: [CommonModule, Buttons, RouterOutlet],
  standalone: true,
  templateUrl: './coappdashboard.html',
  styleUrl: './coappdashboard.scss'
})
export class Coappdashboard implements OnInit {
  applicantId: any;
  applicationId: any
  custName: any;
  arnid: any;
  isChildRouteActive = false;

  coApplicants: any[] = [];
  maxCoApplicants = 4;
  coApplicantIndex: number = 1;

  constructor(public service: Main, private router: Router, private addcustomerservice: Addcustomerservice, private msgBox: Msgboxservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef, private stepperService: Loanstepperservice, private loanfornservice: Loanformservice) { }

  ngOnInit() {
    this.stepperService.restoreLoanEditContext();
    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    this.custName = Allids[2];
    this.arnid = Allids[3];


    if (!this.applicantId || !this.applicationId) {
      console.error('Loan context missing after refresh');
      return;
    }

    let AllCoapp_ids = this.stepperService.getCo_appId();



    if (

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
          undefined, this.stepperService.getCurrentCoApplicantIndex());
      }
    }
    this.getAllcoapplicants();
    this.loadCoApplicants();
  }
  add() {

    sessionStorage.removeItem('coAppIds');
    sessionStorage.removeItem('coapp_cifdetails');

    this.stepperService.clearCoAppId?.();

    this.loadCoApplicants();

    if (this.coApplicants.length >= this.maxCoApplicants) {
      alert('Maximum 4 co-applicants can be added.');
      return;
    }

    const nextIndex = this.getNextAvailableCoApplicantIndex();
    this.clearCoApplicantLocalData(nextIndex);

    sessionStorage.removeItem('coAppIds');
    sessionStorage.removeItem('coapp_cifdetails');
    this.stepperService.setStepperType('CO_APPLICANT');
    this.stepperService.setCurrentCoApplicantIndex(nextIndex);

    // localStorage.removeItem(`coapp_completedSteps_${this.applicantId}_${nextIndex}`);


    this.router.navigate(
      ['coapplicantinfo'],
      {
        relativeTo: this.route,
        queryParams: {

          coApplicantIndex: nextIndex, mode: 'new'
        },
        // queryParamsHandling: 'merge' 
      }
    );

  }
  getNextAvailableCoApplicantIndex(): number {
    const usedIndexes = this.coApplicants.map(x => Number(x.index));

    for (let i = 1; i <= this.maxCoApplicants; i++) {
      if (!usedIndexes.includes(i)) {
        return i;
      }
    }

    return this.maxCoApplicants;
  }

  loadCoApplicants1() {
    const saved = localStorage.getItem(`coApplicants_${this.applicantId}`);
    this.coApplicants = saved ? JSON.parse(saved) : [];
  }
  //get all applicants
  getAllcoapplicants() {
    this.loanfornservice.getAllCoapp(this.applicationId).subscribe({
      next: (res: any) => {
        console.log('Co-applicants API response:', res);

        const data = Array.isArray(res?.data) ? res.data : [];

        this.coApplicants = data.map((item: any, i: number) => ({
          index: Number(item.index || i + 1),
          applicantId: item.applicantId,
          applicationId: this.applicationId,
          name: item.name || '',
          status: item.status || '',
        }));

        this.coApplicants = this.coApplicants.sort(
          (a: any, b: any) => Number(a.index) - Number(b.index)
        );

        localStorage.setItem(
          this.getCoappListKey(),
          JSON.stringify(this.coApplicants)
        );

        this.updateCoApplicantStepStatus();
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load co-applicants:', err);

        // fallback local data
        this.loadCoApplicants();
      }
    });
  }

  loadCoApplicants() {
    const saved = localStorage.getItem(this.getCoappListKey());
    this.coApplicants = saved ? JSON.parse(saved) : [];

    this.coApplicants = this.coApplicants.sort(
      (a: any, b: any) => Number(a.index) - Number(b.index)
    );

    this.updateCoApplicantStepStatus();
  }
  updateCoApplicantStepStatus() {
    const stepRoute = this.getStepRoute();

    if (this.coApplicants.length > 0) {
      this.stepperService.markStepCompleted(stepRoute);
    } else {
      // optional if your service has remove method
      this.stepperService.removeStepCompleted?.(stepRoute);
    }
  }
  //restore
  private restoreCoApplicantContext(): void {
    const storedCoApp = sessionStorage.getItem('coAppIds');

    if (!storedCoApp) return;

    try {
      const parsed = JSON.parse(storedCoApp);

      this.stepperService.setCurrentCoApplicantIndex(
        parsed.coApplicantIndex || 1
      );

      this.stepperService.setCo_appId(
        parsed.applicantId,
        parsed.applicationId,
        parsed.fullName,
        parsed.custARN,
        parsed.coApplicantIndex
      );
    } catch {
      sessionStorage.removeItem('coAppIds');
    }
  }
  private getCoappListKey(): string {
    return `coApplicants_${this.applicantId}`;
  }

  //open 
  openCoApplicant(index: number) {
    const current = this.coApplicants.find(
      x => Number(x.index) === Number(index)
    );

    if (!current) return;

    this.stepperService.setStepperType('CO_APPLICANT');

    this.stepperService.setCurrentCoApplicantIndex(current.index);


    sessionStorage.setItem('coAppIds', JSON.stringify({
      applicantId: current.applicantId,
      applicationId: current.applicationId || this.applicationId,
      fullName: current.name || '',
      coApplicantIndex: index,
      status: current.status || ''
    }));

    this.stepperService.setCo_appId(
      current.applicantId,
      current.applicationId || this.applicationId,
      current.name || '',
      undefined, current.index
    );


    this.router.navigate(
      ['coapplicantinfo', 'co-basicinfo'],
      {
        relativeTo: this.route,
        queryParams: {

          coApplicantIndex: current.index,

          id: current?.userInitiateId || '',
          phone: current?.phone || '',
          mode: 'existing'

        }
      }
    );
  }

  //delete 

  deleteCoApplicant1(index: number, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    // remove card from dashboard list
    this.coApplicants = this.coApplicants.filter(
      x => Number(x.index) !== Number(index)
    );

    localStorage.setItem(
      `coApplicants_${this.applicantId}`,
      JSON.stringify(this.coApplicants)
    );

    // clear all old form data for this coapp index
    this.clearCoApplicantLocalData(index);

    this.loanfornservice.deleteCoapp(this.applicantId, this.applicantId).subscribe({


      next: (res) => {
        console.log(res);
      }
    });
    this.loadCoApplicants();
    this.updateCoApplicantStepStatus();
    this.cd.detectChanges();

  }
 deleteCoApplicant(index: number, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();
 
    this.msgBox.open({
      title: 'Are you sure want to Delete',
      message: `${this.coApplicants[index - 1].name} (Co-Applicant ${index})`,
      showCancel: true,
      onOk: () => {
        this.loanfornservice.deleteCoapp(this.applicationId, this.coApplicants[index - 1].applicantId).subscribe({
          next: (res) => {
            // remove card from dashboard list
            this.coApplicants = this.coApplicants.filter(
              x => Number(x.index) !== Number(index)
            );
 
            console.log(this.coApplicants);
 
            localStorage.setItem(
              `coApplicants_${this.applicantId}`,
              JSON.stringify(this.coApplicants)
            );
 
            // clear all old form data for this coapp index
            this.clearCoApplicantLocalData(index);
 
            this.loadCoApplicants(); this.updateCoApplicantStepStatus();
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
 
    this.cd.detectChanges();
  }


  private clearCoApplicantLocalData(index: number): void {
    const mainApplicantId = this.applicantId;

    // exact keys
    const exactKeys = [
      `coapp_mobile_submitted_${mainApplicantId}_${index}`,
      `coapp_completedSteps_${mainApplicantId}_${index}`,
      `coapp_stepData_${mainApplicantId}_${index}`,
      `coapp_currentStep_${mainApplicantId}_${index}`,

      // if you used these patterns anywhere
      `basicInfoData_coapp_${mainApplicantId}_${index}`,
      `generalInfoData_coapp_${mainApplicantId}_${index}`,
      `additionalinfo_coapp_${mainApplicantId}_${index}`,
      `kycInfoData_coapp_${mainApplicantId}_${index}`,
      `IncomeInfoData_coapp_${mainApplicantId}_${index}`,
      `assetsinfoData_coapp_${mainApplicantId}_${index}`,
      `liabilitiesinfoData_coapp_${mainApplicantId}_${index}`,
      `monthlyexpinfoData_coapp_${mainApplicantId}_${index}`,
      `summaryinfoData_coapp_${mainApplicantId}_${index}`,
    ];

    exactKeys.forEach(key => localStorage.removeItem(key));

    // remove any dynamic keys related to this coapp index
    const patterns = [
      `_coapp_${mainApplicantId}_${index}`,
      `_coapp_${index}`,
      `${mainApplicantId}_${index}`,
      `coapp_${mainApplicantId}_${index}`,
    ];

    Object.keys(localStorage).forEach(key => {
      if (patterns.some(pattern => key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });

    // clear session if current coapp deleted
    const storedCoApp = sessionStorage.getItem('coAppIds');
    if (storedCoApp) {
      try {
        const parsed = JSON.parse(storedCoApp);
        if (Number(parsed.coApplicantIndex) === Number(index)) {
          sessionStorage.removeItem('coAppIds');
        }
      } catch {
        sessionStorage.removeItem('coAppIds');
      }
    }

    // reset service state also
    this.stepperService.setCurrentCoApplicantIndex(index);
  }
  onChildActivate() {
    this.isChildRouteActive = true;
  }
  get isChildActive(): boolean {
    return !!this.route.firstChild; // child route exists => educationinfo is active
  }

  onChildDeactivate() {
    this.isChildRouteActive = false;
    this.loadCoApplicants();
  }
  get hasAtLeastOneCoApplicant(): boolean {
    return this.coApplicants.length > 0;
  }


  back() { }

  getStepRoute() {
    return 'co-applicantdetails';
  }
  next() {


    if (!this.hasAtLeastOneCoApplicant) {
      return;
    }

    const stepRoute = this.getStepRoute();

    this.stepperService.markStepCompleted(stepRoute);
    this.stepperService.next();

  }

}
