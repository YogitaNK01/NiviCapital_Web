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
        this.stepperService.setCo_appId(
          parsed.applicantId,
          parsed.applicationId,
          parsed.fullName,
          undefined, this.stepperService.getCurrentCoApplicantIndex());
      }
    }
   
    this.loadCoApplicants();
  }
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

  
  //get all applicants
  getAllcoapplicants1() {
    this.loanfornservice.getAllCoapp(this.applicationId).subscribe({
      next: (res: any) => {
        console.log('Co-applicants API response:', res);

        const data = Array.isArray(res?.data) ? res.data : [];

      
        this.coApplicants = data.map((item: any, i: number) => {
  const coapp = {
    index: Number(item.index || i + 1),
    applicantId: item.applicantId,
    applicationId: this.applicationId,
    name: item.name || '',
    phone: item.phone || item.mobileNumber || '',
    userInitiateId: item.userInitiateId || '',
    status: item.status || ''
  };

  return {
    ...coapp,
    uiStatus: this.getCoApplicantStatus(coapp)
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

        // fallback local data
        this.loadCoApplicants();
      }
    });
  }
getAllcoapplicants() {
  this.loanfornservice.getAllCoapp(this.applicationId).subscribe({
    next: (res: any) => {
      console.log('Co-applicants API response:', res);

      const data = Array.isArray(res?.data) ? res.data : [];

      const localSaved = localStorage.getItem(this.getCoappListKey());
      const localList = localSaved ? JSON.parse(localSaved) : [];

      this.coApplicants = data.map((item: any, i: number) => {
        const apiIndex = Number(item.index || i + 1);

        const localMatch =
          localList.find((x: any) =>
            item.applicantId && x.applicantId
              ? x.applicantId === item.applicantId
              : Number(x.index) === apiIndex
          ) || null;

        const coapp = {
          index: apiIndex,
          applicantId: item.applicantId || localMatch?.applicantId || '',
          applicationId: this.applicationId,
          name: item.name || item.fullName || localMatch?.name || '',
          phone: item.phone || item.mobileNumber || localMatch?.phone || '',
          userInitiateId: item.userInitiateId || localMatch?.userInitiateId || '',
          status: item.status || localMatch?.status || 'IN_PROGRESS'
        };

        return {
          ...coapp,
          uiStatus: this.getCoApplicantStatus(coapp)
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
 loadCoApplicants() {
  const saved = localStorage.getItem(this.getCoappListKey());
  this.coApplicants = saved ? JSON.parse(saved) : [];

  this.coApplicants = this.coApplicants
    .sort((a: any, b: any) => Number(a.index) - Number(b.index))
    .map((coapp: any) => ({
      ...coapp,
      uiStatus: this.getCoApplicantStatus(coapp)
    }));

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
  return `coApplicants_${this.applicationId}`;
}

  //open 
  openCoApplicant1(index: number) {
    const current = this.coApplicants.find(
      x => Number(x.index) === Number(index)
    );

    if (!current) return;
 sessionStorage.removeItem('pendingCoAppContext');
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

 const isSubmittedCoapp =
    ['COMPLETED', 'SUBMITTED'].includes(
      (current.status || '').toUpperCase()
    );

    
 if (isSubmittedCoapp) {
    this.markAllCoApplicantStepsCompleted();
  } else {
    this.stepperService.restoreCompletedSteps();
  }

//  this.stepperService.restoreCompletedSteps();
  this.stepperService.rebuildSteps();


const resumeRoute = isSubmittedCoapp
    ? 'co-summaryinfo'
    : this.getResumeRouteForCoApplicant(current);


    this.router.navigate(
      // ['coapplicantinfo', 'co-basicinfo'],
      ['coapplicantinfo', resumeRoute],
      {
        relativeTo: this.route,
        queryParams: {

          coApplicantIndex: current.index,

          // id: current?.userInitiateId || '',
          // phone: current?.phone || '',
          mode: 'existing'

        }
      }
    );
  }
openCoApplicant(index: number) {
  const current = this.coApplicants.find(
    x => Number(x.index) === Number(index)
  );

  if (!current) return;

  // ✅ remove pending new co-app flow context
  sessionStorage.removeItem('pendingCoAppContext');

  this.stepperService.setStepperType('CO_APPLICANT');
  this.stepperService.setCurrentCoApplicantIndex(current.index);

  sessionStorage.setItem('coAppIds', JSON.stringify({
    applicantId: current.applicantId,
    applicationId: current.applicationId || this.applicationId,
    fullName: current.name || '',
    coApplicantIndex: current.index,
    status: current.status || '',
    phone: current.phone || '',
    userInitiateId: current.userInitiateId || ''
  }));

  this.stepperService.setCo_appId(
    current.applicantId,
    current.applicationId || this.applicationId,
    current.name || '',
    undefined,
    current.index
  );

  const isSubmittedCoapp =
    ['COMPLETED', 'SUBMITTED'].includes(
      (current.status || '').toUpperCase()
    );

  if (isSubmittedCoapp) {
    this.coApplicantStepRoutes.forEach(route =>
      this.stepperService.markStepCompleted(route)
    );
  } else {
    this.stepperService.restoreCompletedSteps();
  }

  this.stepperService.rebuildSteps();

  const resumeRoute = isSubmittedCoapp
    ? 'co-summaryinfo'
    : this.getResumeRouteForCoApplicant(current);

  this.router.navigate(
    ['coapplicantinfo', resumeRoute],
    {
      relativeTo: this.route,
      queryParams: {
        coApplicantIndex: current.index,
        mode: 'existing'
      }
    }
  );
}
  private getResumeRouteForCoApplicant(coapp: any): string {
  const completedSteps = this.getCoApplicantCompletedSteps(
    coapp.index,
    coapp.applicantId
  );

  const firstIncomplete = this.coApplicantStepRoutes.find(
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
 
            console.log(this.coApplicants);
 
           
localStorage.setItem(
            this.getCoappListKey(),
            JSON.stringify(this.coApplicants)
          );

 
            // clear all old form data for this coapp index
            this.clearCoApplicantLocalData(index,current.applicantId);
 
            this.loadCoApplicants(); 
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
private getCoApplicantStatus(coapp: any): 'COMPLETED' | 'IN_PROGRESS' {
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
    'co-kycinfo',
    'co-incomeinfo',
    'co-assetsinfo',
    'co-liabilitiesinfo',
    'co-monthlyexpinfo'
  ];

  const isComplete = requiredSteps.every(route =>
    completedSteps.includes(route)
  );

  return isComplete ? 'COMPLETED' : 'IN_PROGRESS';
}
  private getCoApplicantCompletedSteps(index: number, applicantId?: string): string[] {
  const mainApplicantId = this.applicantId;

  const possibleKeys = [
    `coapp_completedSteps_${mainApplicantId}_${applicantId}`,
    `coapp_completedSteps_${mainApplicantId}_${index}`,
    `coapp_completedSteps_${mainApplicantId}_temp_${index}`
  ];

  for (const key of possibleKeys) {
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
  }

  return [];
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
