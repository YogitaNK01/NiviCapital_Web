import { ChangeDetectorRef, Component } from '@angular/core';
import { SummaryHelper } from '../../../../../utils/summaryHelper';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { Inputfield } from '../../../../systemdesign/inputfield/inputfield';
import { otherFields } from '../../../../../shared/config/custdetails.config';
import { Router, ActivatedRoute } from '@angular/router';
import { Addcustomerservice } from '../../../../../core/service/addcustomerservice';
import { Loanformservice } from '../../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';
import { Main } from '../../../../../core/service/main';
@Component({
  selector: 'app-coappsummary',
  imports: [CommonModule, ReactiveFormsModule, Inputfield, Buttons],
  standalone: true,
  templateUrl: './coappsummary.html',
  styleUrl: './coappsummary.scss'
})
export class Coappsummary {

  openIndex: number[] = [0];
  openKeys: string[] = ['basic'];
  accordions = [
    { key: 'basic', title: 'Basic Info', alwaysOpen: true },
    { key: 'general', title: 'General Info', alwaysOpen: true },
    { key: 'additional', title: 'Additional Info', alwaysOpen: false },
    { key: 'kyc', title: 'KYC', alwaysOpen: true },
    { key: 'income', title: 'Income Details', alwaysOpen: true },
    { key: 'assets', title: 'Assets', alwaysOpen: false, amount: 0 },
    { key: 'liabilities', title: 'Liabilities', alwaysOpen: true, amount: 0 },
    { key: 'monthly', title: 'Monthly Expenditure', alwaysOpen: false, amount: 0 },

  ];
  summaryForm!: FormGroup;
  summaryData: any = null;
  summaryLoaded = false;
  basicFields: any[] = [];

  currentOccupation = '';
  courseDetailsFields: { label: string; value: any }[] = [];

  additionalInfoFields: any = {
    applicantDetails: [],
    spouse: [],
    father: [],
    mother: []
  };
  otherFields = otherFields;
  applicantId: any;
  applicationId: any;
  isEmployed = false;
  isSelfEmployed = false;


  KycInfoFields: any = {
    identityAndResidency: [],
    permanentAddress: [],
    currentAddress: [],
    otherAddress: []

  };


  documentTypes = [
    { key: 'salarySlips', label: 'Salary Slip' },
    { key: 'form16', label: 'Form 16' },
    { key: 'bankStatements', label: 'Bank Statement' },
    { key: 'itrs', label: 'ITR' },
    { key: 'otherIncome', label: 'Other Document Name' },

  ];
  incomeDetails: any = {
    editUrl: '',
    salarySlips: [],
    bankStatements: [],
    form16: [],
    itrs: [],
    otherIncome: []
  };
  businessdocumentTypes = [
    { key: 'business_finance_3_years', label: 'Year' },
    { key: 'business_itr_3_years', label: 'ITR' },
    { key: 'business_gst_1_year', label: '1 Year GST return' },
    { key: 'business_bank_statement_1_year', label: '1 Year Bank Statement' },

    { key: 'otherBussinessincome', label: 'Other Document Name' },

  ];
  incomeBusinessDetails: any = {
    editUrl: '',
    business_gst_1_year: [],
    business_itr_3_years: [],
    business_bank_statement_1_year: [],
    business_finance_3_years: [],
    oneYearGstReturns: [],
    otherBussinessincome: []
  };


  // Declare monthlyExpenditure property to hold API data
  monthlyExpenditure: any = {
    totalMonthlyInr: 0,
    rentHomeMaintenance: null,
    groceriesHousehold: null,
    utilitiesElectricityWaterGas: null,
    transportation: null,
    schoolEducationFees: null,
    medicalMedicines: null,
    otherRecurringExpenses: [
      { expenseName: '', amountInr: '' }
    ]
  };
  // Define the dynamic fields array for iteration in template
  monthlyExpenditureFields = [
    { key: 'rentHomeMaintenance', label: 'Rent / Home Maintenance' },
    { key: 'groceriesHousehold', label: 'Groceries and Household' },
    { key: 'utilitiesElectricityWaterGas', label: 'Utilities / Bills (Electricity, Water, Gas)' },
    { key: 'transportation', label: 'Transportation' },
    { key: 'schoolEducationFees', label: 'School Education Fees' },
    { key: 'medicalMedicines', label: 'Medical / Medicines' },
    { key: 'otherRecurringExpenses', label: 'Other Recurring Expenses' }
  ];



  assetsSections: any[] = [];
  isasset: boolean = false;
  liabilitiesSections: any[] = [];


  filteredAccordions: any[] = [];
  showIncome = false;
  showAssets = false;
  showMonthly = false;
  totalassetsval: any;
  totalliabilities: any;
  totalMonthlyExpenditure: any;

  isSubmittingSummary = false;
  isSummarySubmitted = false;

  constructor(private fb: FormBuilder, private formSvc: Loanformservice, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }

  ngOnInit(): void {
    let Allids = this.stepperService.getLoanId();

    this.applicantId = Allids[0];
    this.applicationId = Allids[1];
    // this.custName = Allids[2];
    // this.custARN = Allids[3];

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


    this.applicantId = AllCoapp_ids[0];
    this.applicationId = AllCoapp_ids?.[1];

    this.syncSubmitButtonState();

    this.stepperService.rebuildSteps();
    this.getcoappSummarydetails();
    this.buildForm();


  }


  private getCurrentCoApplicantIndex(): number {
    return Number(
      this.route.snapshot.queryParamMap.get('coApplicantIndex') ||
      this.stepperService.getCurrentCoApplicantIndex() ||
      1
    );
  }

  private syncSubmitButtonState(): void {
    const loanIds = this.stepperService.getLoanId();
    const mainApplicantId = loanIds?.[0];

    if (!mainApplicantId) {
      this.isSummarySubmitted = false;
      return;
    }

    const key = `coApplicants_${mainApplicantId}`;
    const saved = localStorage.getItem(key);
    const coApplicants = saved ? JSON.parse(saved) : [];

    const currentIndex = this.getCurrentCoApplicantIndex();

    const currentCoapp = coApplicants.find(
      (x: any) =>
        Number(x.index) === Number(currentIndex) ||
        (this.applicantId && String(x.applicantId) === String(this.applicantId))
    );

    this.isSummarySubmitted = !!currentCoapp?.completed;
  }

  get isSubmitDisabled(): boolean {
    return this.isSubmittingSummary || this.isSummarySubmitted;
  }

  trackByKey(index: number, field: any) {
    return field.key;
  }
  trackByAccordion(index: number, acc: any) {
    return acc.key;
  }


  buildForm() {
    const group: { [key: string]: FormControl } = {};
    this.summaryForm = new FormGroup(group);
  }


  toggle(key: string) {
    if (this.openKeys.includes(key)) {
      this.openKeys = this.openKeys.filter(k => k !== key);
    } else {
      this.openKeys.push(key);
    }
  }

  getcoappSummarydetails() {
    this.formSvc.getCoappSummary(this.applicationId, this.applicantId).subscribe(
      (res: any) => {
        if (res && res.status === 'success' && res.data) {
          const data = res.data;
          this.summaryData = data;
          this.formSvc.setSummary(data);

          const basicInfoData = SummaryHelper.extractcoappBasicInfo(data);
          this.basicFields = basicInfoData.basicDetailsFields || [];
          // Use helper methods to extract data
          const generalInfoData = SummaryHelper.extractcoappGeneralInfo(data.generalInfo);
          this.currentOccupation = generalInfoData.currentOccupation;
          this.courseDetailsFields = generalInfoData.courseDetailsFields;
          this.isasset = this.courseDetailsFields.some((field: any) => field.label === 'Do you have Assets?' && field.value === 'Yes');

          const occupation = this.normalizeOccupation(this.currentOccupation);



          this.isEmployed = occupation === 'employed';
          this.isSelfEmployed = occupation === 'self employed' || occupation === 'Self-employed';
          this.showIncome = this.isEmployed || this.isSelfEmployed;

          this.showAssets =
            this.isasset === true &&
            occupation !== 'housewife' &&
            occupation !== 'housewife / homemaker';

          this.filteredAccordions = this.accordions.filter(acc => {


            if (acc.key === 'income' && !this.showIncome) return false;
            if (acc.key === 'assets' && !this.showAssets) return false;



            return true;
          });




          const additionalInfoData = SummaryHelper.extractAdditionalInfo(data.additionalInfo, 'CO_APPLICANT');
          this.additionalInfoFields = additionalInfoData;

          const KYCInfoData = SummaryHelper.extractKYCInfo(data.kyc);
          this.KycInfoFields = KYCInfoData;

          this.incomeDetails = data.incomeDetails || {
            editUrl: '',
            salarySlips: [],
            bankStatements: [],
            form16: [],
            itrs: [],
            otherIncome: []
          };

          this.incomeBusinessDetails = data.incomeBusinessDetails || {
            editUrl: '',
            business_gst_1_year: [],
            business_itr_3_years: [],
            business_bank_statement_1_year: [],
            business_finance_3_years: [],
            oneYearGstReturns: [],
            otherBussinessincome: []
          };


          // this.monthlyExpenditure = res.data.monthlyExpenditure || this.monthlyExpenditure;
          this.monthlyExpenditure = { ...this.monthlyExpenditure, ...(res.data.monthlyExpenditure || {}) };

          const allFields = [
            { key: 'rentHomeMaintenance', label: 'Rent / Home Maintenance' },
            { key: 'groceriesHousehold', label: 'Groceries and Household' },
            { key: 'utilitiesElectricityWaterGas', label: 'Utilities / Bills (Electricity, Water, Gas)' },
            { key: 'transportation', label: 'Transportation' },
            { key: 'schoolEducationFees', label: 'School Education Fees' },
            { key: 'medicalMedicines', label: 'Medical / Medicines' },
            //  { key: 'otherRecurringExpenses', label: 'Other Recurring Expenses' }
          ];

          // this.monthlyExpenditureFields = allFields.filter(field => this.monthlyExpenditure[field.key] != null);
          this.monthlyExpenditureFields = allFields.filter(field =>
            this.hasMonthlyValue(this.monthlyExpenditure[field.key])
          );
          this.totalMonthlyExpenditure = res.data.monthlyExpenditure.totalMonthlyInr;
          this.accordions[7].amount = this.totalMonthlyExpenditure;


          this.assetsSections = SummaryHelper.extractAssetsInfo(res.data.assets);
          console.log("assetsSections", this.assetsSections);

          this.totalassetsval = res.data.assets.totalAssets;
          // this.accordions[6].amount = this.totalassetsval;


          this.liabilitiesSections = SummaryHelper.extractLiabilitiesInfo(res.data.liabilities);
          this.totalliabilities = res.data.liabilities.totalLiabilities;
          // this.accordions[7].amount = this.totalliabilities;



          this.cd.detectChanges();
        }
      },
      (error) => {
        console.error('Error fetching summary details:', error);
      }
    );
  }

  submitsummary() {

    if (this.isSubmitDisabled) {
      return;
    }

    this.isSubmittingSummary = true;

    let input = {
      "applicationId": this.applicationId,
      "applicantId": this.applicantId
    }
    this.formSvc.submitCoappSummary(input).subscribe(
      (res: any) => {
        console.log(res)
        if (res.status === "success") {
          this.saveCoApplicantOnDashboard();

          this.isSummarySubmitted = true;
          this.isSubmittingSummary = false;
          this.formSvc.getAllCoapp(this.applicationId).subscribe({
 
            next: (res: any) => {
              this.router.navigate(['/loanform/co-applicantdetails']);
            }, error: (err) => { }
          });
          // this.router.navigate(['/loanform/co-applicantdetails']);
        }
      },

      (error) => {
        console.error('Submit summary failed', error);
      }

    )
  }
  saveCoApplicantOnDashboard() {
    const loanIds = this.stepperService.getLoanId();
    const mainApplicantId = loanIds?.[0];

    const coApplicantIndex = this.getCurrentCoApplicantIndex();

    const key = `coApplicants_${mainApplicantId}`;
    const saved = localStorage.getItem(key);
    let coApplicants = saved ? JSON.parse(saved) : [];

    const fullName = this.getCoApplicantFullName();

    const existingIndex = coApplicants.findIndex(
      (x: any) => Number(x.index) === coApplicantIndex
    );

    const coappObj = {
      index: coApplicantIndex, applicantId: this.applicantId,
      name: fullName || `Co-Applicant ${coApplicantIndex}`,
      completed: true
    };

    if (existingIndex >= 0) {
      coApplicants[existingIndex] = coappObj;
    } else {
      coApplicants.push(coappObj);
    }

    coApplicants = coApplicants.sort((a: any, b: any) => Number(a.index) - Number(b.index));

    localStorage.setItem(key, JSON.stringify(coApplicants));
  }
  getCoApplicantFullName(): string {
    const firstName =
      this.basicFields?.find((f: any) => f.label === 'First Name')?.value || '';

    const middleName =
      this.basicFields?.find((f: any) => f.label === 'Middle Name')?.value || '';

    const lastName =
      this.basicFields?.find((f: any) => f.label === 'Last Name')?.value || '';

    return `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, ' ')
      .trim();
  }

  submit() { }

  labelDisplayMap: { [key: string]: string } = {
    'GROCERIES HOUSEHOLD': 'Groceries and Household',
    'RENT HOME MAINTENANCE': 'Rent / Home Maintenance',
    'TRANSPORTATION': 'Transportation',
    'SCHOOL EDUCATION FEES': 'School Education Fees',
    'MEDICAL MEDICINES': 'Medical / Medicines',
    'UTILITIES': 'Utilities',
    'OTHER RECURRING EXPENSES': 'Other Recurring Expenses'
  };

  getDisplayLabel(rawName: string): string {
    if (!rawName) return '-';
    // Normalize key to uppercase trimmed for matching
    const key = rawName.trim().toUpperCase();
    return this.labelDisplayMap[key] || rawName;
  }

  hasArrayData(data: any, keys: string[]): boolean {
    return keys.some(key => Array.isArray(data?.[key]) && data[key].length > 0);
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  hasIncomeData(): boolean {
    const salariedKeys = [
      'salarySlips',
      'bankStatements',
      'form16',
      'itrs',
      'otherIncome'
    ];

    const businessKeys = [
      'business_gst_1_year',
      'business_itr_3_years',
      'business_bank_statement_1_year',
      'business_finance_3_years',
      'otherBussinessincome'
    ];

    return (
      this.hasArrayData(this.incomeDetails, salariedKeys) ||
      this.hasArrayData(this.incomeBusinessDetails, businessKeys)
    );
  }
  formatInr(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }
  private normalizeOccupation(value: string): string {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ');
  }
  private hasMonthlyValue(val: any): boolean {
    if (val == null) return false;

    if (Array.isArray(val)) return val.length > 0;

    if (typeof val === 'object') {
      const amount = val.amountInr;
      const name = val.name;
      return (amount != null && amount !== '' && Number(amount) !== 0) || !!name;
    }

    return val !== '';
  }

  //

  goTocoappEdit(sectionKey: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const frontendRouteMap: any = {
      basic: '/loanform/co-applicantdetails/coapplicantinfo/co-basicinfo',
      general: '/loanform/co-applicantdetails/coapplicantinfo/co-generalinfo',
      additional: '/loanform/co-applicantdetails/coapplicantinfo/co-additionalinfo',
      kyc: '/loanform/co-applicantdetails/coapplicantinfo/co-kyc',
      income: '/loanform/co-applicantdetails/coapplicantinfo/co-incomeinfo',
      assets: '/loanform/co-applicantdetails/coapplicantinfo/co-assetsinfo',
      liabilities: '/loanform/co-applicantdetails/coapplicantinfo/co-liabilitiesinfo',
      monthly: '/loanform/co-applicantdetails/coapplicantinfo/co-monthlyexpinfo'
    };

    const route = frontendRouteMap[sectionKey];

    if (!route) {
      console.warn('No frontend route found for section:', sectionKey);
      return;
    }

    this.formSvc.startSummaryEditFlow(this.summaryData, 'CO_APPLICANT');

  const coApplicantIndex = this.stepperService.getCurrentCoApplicantIndex();

    this.router.navigate([route], {
      queryParams: {
        fromSummary: true,
        mode: 'view',
        section: sectionKey, coApplicantIndex: coApplicantIndex
      }
    });
  }
}
