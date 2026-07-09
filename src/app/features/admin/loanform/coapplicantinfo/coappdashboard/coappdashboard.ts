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

  private readonly coApplicantStepRoutes = [
    'co-basicinfo',
    'co-generalinfo',
    'co-additionalinfo',
    'co-kyc',
    'co-incomeinfo',
    'co-assetsinfo',
    'co-liabilitiesinfo',
    'co-monthlyexpinfo',
    'co-summaryinfo'
  ];

  //toretrive data
  removedCoApplicants: any[] = [];

  //edit from summary
  isFromSummary = false;
  isViewMode = false;
  isEditMode = false;
  originalFormValue: any = null;

  coappSummaryData: any = {};

  editSuccess: any = false;
  description1 = `Great ! Your Additional Info Details\n Uploaded Successfully.`;

  constructor(public service: Main, private router: Router, private addcustomerservice: Addcustomerservice, private msgBox: Msgboxservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef, private stepperService: Loanstepperservice, private loanfornservice: Loanformservice) { }

  ngOnInit() {

    this.stepperService.restoreLoanEditContext();
    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    this.custName = Allids[2];
    this.arnid = Allids[3];

    this.getAllcoapplicants();
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

        this.stepperService.setCurrentCoApplicantIndex(parsed.coApplicantIndex || 1);

        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
          undefined, parsed.coApplicantIndex || 1);
      }
    }

    this.loadCoApplicants();

    this.loadRemovedCoApplicants();


  }
  //add new coapp
  add() {

    this.loadCoApplicants();

    if (this.coApplicants.length >= this.maxCoApplicants) {
      alert('Maximum 4 co-applicants can be added.');
      return;
    }



    const nextIndex = this.getNextAvailableCoApplicantIndex();
    sessionStorage.removeItem('coAppIds');
    sessionStorage.removeItem('coapp_cifdetails');
    sessionStorage.removeItem('pendingCoAppContext');

    this.stepperService.clearCoAppId?.();
    this.stepperService.setStepperType('CO_APPLICANT');
    this.stepperService.setCurrentCoApplicantIndex(nextIndex);
    this.clearCoApplicantLocalData(nextIndex);


    sessionStorage.setItem('coAppIds', JSON.stringify({
      applicantId: '',
      applicationId: this.applicationId,
      fullName: '',
      coApplicantIndex: nextIndex,
      status: '',
      phone: '',
      userInitiateId: '',
      mode: 'new'
    }));

    // if(this.isFromSummary){
    //       this.loanfornservice.clearSummaryEditFlow();
    //       this.isFromSummary = false;
    //     }

    this.loanfornservice.clearSummaryEditFlow();
    this.loanfornservice.clearSummaryEducationEditFlow?.();
    this.isFromSummary = false;

    this.loanfornservice.coappStep = 1;

localStorage.removeItem(
  `coapp_mobile_submitted_${this.applicantId}_${nextIndex}`
);

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


  //get all applicants

  getAllcoapplicants() {
    this.loanfornservice.getAllCoapp(this.applicationId).subscribe({
      next: (res: any) => {
        console.log('Co-applicants API response:', res);

        const data = Array.isArray(res?.data) ? res.data : [];

        const localSaved = localStorage.getItem(this.getCoappListKey());
        const localList1 = localSaved ? JSON.parse(localSaved) : [];
        const localList = localSaved
          ? JSON.parse(localSaved).filter((x: any) => x.applicantId || x.name)
          : [];
        this.coApplicants = data.map((item: any, i: number) => {
          const apiIndex = Number(item.index || i + 1);

          const localMatch =
            localList.find((x: any) =>
              item.applicantId && x.applicantId
                ? x.applicantId === item.applicantId
                : Number(x.index) === apiIndex
            ) || null;

          const localStatus = (localMatch?.status || localMatch?.uiStatus || '').toUpperCase();
          const apiStatus = (item.status || '').toUpperCase();

          const finalStatus =
            localStatus === 'COMPLETED' || localStatus === 'SUBMITTED'
              ? localStatus
              : apiStatus || localStatus || '';

          const coapp = {
            index: apiIndex,
            applicantId: item.applicantId || localMatch?.applicantId || '',
            applicationId: this.applicationId,
            name: item.name || item.fullName || localMatch?.name || '',
            phone: item.phone || item.mobileNumber || localMatch?.phone || '',
            userInitiateId: item.userInitiateId || localMatch?.userInitiateId || '',
            status: finalStatus || '',
            currentStage: item.currentStage,
            nextStage: item.nextStage
          };

          return {
            ...coapp,
            // status: this.getCoApplicantStatus(coapp)
          };
        });

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
        this.loadCoApplicants();
      }
    });
  }
  loadCoApplicants1() {
    const saved = localStorage.getItem(this.getCoappListKey());
    this.coApplicants = saved ? JSON.parse(saved) : [];

    this.coApplicants = this.coApplicants
      .sort((a: any, b: any) => Number(a.index) - Number(b.index))
      .map((coapp: any) => ({
        ...coapp,
        // status: this.getCoApplicantStatus(coapp)
      }));

    this.updateCoApplicantStepStatus();
  }
  loadCoApplicants() {
    const saved = localStorage.getItem(this.getCoappListKey());
    this.coApplicants = saved ? JSON.parse(saved) : [];

    // Do not show temporary number-only co-applicants
    this.coApplicants = this.coApplicants.filter((x: any) =>
      x.applicantId || x.name
    );

    this.coApplicants = this.coApplicants
      .sort((a: any, b: any) => Number(a.index) - Number(b.index))
      .map((coapp: any) => ({
        ...coapp
      }));

    localStorage.setItem(
      this.getCoappListKey(),
      JSON.stringify(this.coApplicants)
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

    if (storedCoApp) {
      const parsed = JSON.parse(storedCoApp);

      this.stepperService.setCurrentCoApplicantIndex(parsed.coApplicantIndex || 1);

      this.stepperService.setCo_appId(
        parsed.applicantId,
        parsed.applicationId,
        parsed.fullName,
        undefined,
        parsed.coApplicantIndex || 1
      );
    }
  }
  private getCoappListKey(): string {
    return `coApplicants_${this.applicationId}`;
  }

  //open 


  openCoApplicant(index: number) {
    const current = this.coApplicants.find(
      x => Number(x.index) === Number(index)
    );

    if (!current) return;

     // ✅ Existing coapp should open stepper, not mobile screen
  this.loanfornservice.coappStep = 2;

  localStorage.setItem(
    `coapp_mobile_submitted_${this.applicantId}_${current.index}`,
    'true'
  );

    sessionStorage.removeItem('pendingCoAppContext');

    this.stepperService.setStepperType('CO_APPLICANT');
    this.stepperService.setCurrentCoApplicantIndex(current.index);

    const status = (
      current.status ||
      current.uiStatus ||
      ''
    ).toUpperCase();

    const isCompletedCoapp =
      status === 'COMPLETED' ||
      status === 'SUBMITTED';

    if (!isCompletedCoapp) {
      this.loanfornservice.clearSummaryEditFlow();
      this.loanfornservice.clearSummaryEducationEditFlow?.();
    }

    sessionStorage.setItem('coAppIds', JSON.stringify({
      applicantId: current.applicantId,
      applicationId: current.applicationId || this.applicationId,
      fullName: current.name || '',
      coApplicantIndex: current.index,
      status: current.status || current.uiStatus || '',
      phone: current.phone || '',
      userInitiateId: current.userInitiateId || '',
      mode: isCompletedCoapp ? 'view' : 'existing'
    }));

    this.stepperService.setCo_appId(
      current.applicantId,
      current.applicationId || this.applicationId,
      current.name || '',
      undefined,
      current.index
    );

    this.loanfornservice.getCoappSummary(this.applicationId, current.applicantId).subscribe({
      next: (res: any) => {
        if (res.status === "success") {
          this.coappSummaryData = res.data;
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })

    const resumeRoute = isCompletedCoapp
      ? 'co-summaryinfo'
      : this.getResumeRouteForCoApplicant(current);

    this.router.navigate(
      ['coapplicantinfo', resumeRoute],
      {
        relativeTo: this.route,
        queryParams: {
          coApplicantIndex: current.index,
          mode: isCompletedCoapp ? 'view' : 'existing',
          fromSummary: isCompletedCoapp ? true : null
        }
      }
    );
  }

  private getResumeRouteForCoApplicant(coapp: any): string {
    const completedSteps = this.getCoApplicantCompletedSteps(
      coapp.index,
      coapp.applicantId
    );

    let coappSteps = this.coApplicantStepRoutes;

    if (this.coappSummaryData) {
      const occupation = this.coappSummaryData?.generalInfo?.occupationInfo?.occupation;
      if (occupation === "Unemployed" || occupation === "Housewife / Homemaker") {
        coappSteps = coappSteps.filter((item: any) => item !== "co-incomeinfo");
      }
    }

    const firstIncomplete = coappSteps.find(
      route => !completedSteps.includes(route)
    );

    return firstIncomplete || 'co-summaryinfo';
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
      `coApplicants_${this.applicationId}`,
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

  private clearCoApplicantLocalData(index: number, coApplicantId?: string): void {
    const mainApplicantId = this.applicantId;

    const exactKeys = [
      `coapp_mobile_submitted_${mainApplicantId}_${index}`,
      `coapp_completedSteps_${mainApplicantId}_${index}`,
      `coapp_currentStep_${mainApplicantId}_${index}`,

      `basicInfo_coapp_${coApplicantId || 'temp_' + index}`,
      `generalInfo_coapp_${coApplicantId || 'temp_' + index}`,
      `additionalinfo_coapp_${coApplicantId || 'temp_' + index}`,
      `kycInfoData_coapp_${coApplicantId || 'temp_' + index}`,
      `IncomeInfoData_coapp_${coApplicantId || 'temp_' + index}`,
      `assetsinfoData_coapp_${coApplicantId || 'temp_' + index}`,
      `liabilitiesinfoData_coapp_${coApplicantId || 'temp_' + index}`,
      `monthlyExpenditureData_coapp_${coApplicantId || 'temp_' + index}`,
      `summaryinfoData_coapp_${coApplicantId || 'temp_' + index}`,
    ];

    exactKeys.forEach(key => localStorage.removeItem(key));

    const patterns = [
      `_coapp_${coApplicantId || 'temp_' + index}`,
      `_coapp_${index}`,
      `${coApplicantId || 'temp_' + index}`
    ];

    Object.keys(localStorage).forEach(key => {
      if (patterns.some(pattern => key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });

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
  }

  // coapplicant status
  private getCoApplicantStatus(coapp: any): 'COMPLETED' | 'DRAFT' {
    const apiStatus = (coapp.status || '').toUpperCase();

    if (apiStatus === 'COMPLETED' || apiStatus === 'SUBMITTED') {
      return 'COMPLETED';
    }

    const completedSteps = this.getCoApplicantCompletedSteps(
      coapp.index,
      coapp.applicantId
    );

    const requiredSteps = [
      'co-basicinfo',
      'co-generalinfo',
      'co-additionalinfo',
      'co-kyc',
      'co-incomeinfo',
      'co-assetsinfo',
      'co-liabilitiesinfo',
      'co-monthlyexpinfo'
    ];

    const isComplete = requiredSteps.every(route =>
      completedSteps.includes(route)
    );

    return isComplete ? 'COMPLETED' : 'DRAFT';
  }
  private getCoApplicantCompletedSteps(index: number, applicantId?: string): string[] {
    const mainApplicantId = this.applicantId;

    const possibleKeys = [
      `coapp_completedSteps_${mainApplicantId}_${applicantId}`,
      `coapp_completedSteps_${mainApplicantId}_${index}`,
      `coapp_completedSteps_${mainApplicantId}_temp_${index}`
    ];


    const merged = new Set<string>();
    for (const key of possibleKeys) {
      const saved = localStorage.getItem(key);
      if (!saved) continue;
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(step => merged.add(step));
        }
      } catch {
      }
    }
    return Array.from(merged);
  }

  // mark as completed
  private markAllCoApplicantStepsCompleted() {
    this.coApplicantStepRoutes.forEach(route => {
      this.stepperService.markStepCompleted(route);
    });
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
    return this.coApplicants.length > 0 &&
      this.coApplicants.every(item => this.getCoApplicantStatus(item) === 'COMPLETED');
  }

  //delete
  deleteCoApplicant(index: number, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();


    const current = this.coApplicants.find(
      x => Number(x.index) === Number(index)
    );

    if (!current) return;


    this.msgBox.open({
      title: 'Are you sure want to Delete',
      message: `${current.name || 'Co-Applicant'} (Co-Applicant ${index})`,
      showCancel: true,
      onOk: () => {
        this.loanfornservice.deleteCoapp(this.applicationId, current.applicantId).subscribe({
          next: (res) => {
            // remove card from dashboard list
            this.coApplicants = this.coApplicants.filter(
              x => Number(x.index) !== Number(index)
            );


            // add to removed list if not already present
            const alreadyRemoved = this.removedCoApplicants.some(
              x => Number(x.index) === Number(index)
            );

            if (!alreadyRemoved) {
              this.removedCoApplicants.push({
                ...current,
                archivedAt: new Date().toISOString()
              });

              this.removedCoApplicants = this.removedCoApplicants.sort(
                (a: any, b: any) => Number(a.index) - Number(b.index)
              );
            }



            localStorage.setItem(
              this.getCoappListKey(),
              JSON.stringify(this.coApplicants)
            );

            this.saveRemovedCoApplicants();



            // this.clearCoApplicantLocalData(index, current.applicantId); not clearing data as want to retrive

            this.loadCoApplicants();
            this.loadRemovedCoApplicants();
            this.updateCoApplicantStepStatus();
            this.cd.detectChanges();
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });

    this.cd.detectChanges();
  }

  //retrive delted items
  private getRemovedCoappListKey(): string {
    return `removedCoApplicants_${this.applicationId}`;
  }
  loadRemovedCoApplicants() {
    const saved = localStorage.getItem(this.getRemovedCoappListKey());
    this.removedCoApplicants = saved ? JSON.parse(saved) : [];

    this.removedCoApplicants = this.removedCoApplicants.sort(
      (a: any, b: any) => Number(a.index) - Number(b.index)
    );
  }

  private saveRemovedCoApplicants() {
    localStorage.setItem(
      this.getRemovedCoappListKey(),
      JSON.stringify(this.removedCoApplicants)
    );
  }
  restoreCoApplicant(index: number, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    const current = this.removedCoApplicants.find(
      x => Number(x.index) === Number(index)
    );

    if (!current) return;

    this.msgBox.open({
      title: 'Are you sure want to Retrieve',
      message: `${current.name || 'Co-Applicant'} (Co-Applicant ${index})`,
      showCancel: true,
      onOk: () => {
        this.loanfornservice.retriveCoapp(this.applicationId, current.applicantId).subscribe({
          next: (res) => {
            // remove from removed list
            this.removedCoApplicants = this.removedCoApplicants.filter(
              x => Number(x.index) !== Number(index)
            );

            // add back to active list
            const existsInActive = this.coApplicants.some(
              x => Number(x.index) === Number(index)
            );

            if (!existsInActive) {
              this.coApplicants.push({
                ...current,
                status: current.status || 'DRAFT'
              });

              this.coApplicants = this.coApplicants.sort(
                (a: any, b: any) => Number(a.index) - Number(b.index)
              );
            }

            localStorage.setItem(
              this.getCoappListKey(),
              JSON.stringify(this.coApplicants)
            );

            this.saveRemovedCoApplicants();

            this.loadCoApplicants();
            this.getAllcoapplicants();
            this.loadRemovedCoApplicants();
            this.updateCoApplicantStepStatus();
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error('Retrieve co-applicant failed', err);
          }
        });
      }
    });
  }

  get totalCoApplicantSlotsUsed(): number {
    return (this.coApplicants?.length || 0) + (this.removedCoApplicants?.length || 0);
  }

  get canAddMoreCoApplicants(): boolean {
    return this.totalCoApplicantSlotsUsed < this.maxCoApplicants;
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
