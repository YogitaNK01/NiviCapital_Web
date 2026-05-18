import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';
import { otherFields } from '../../../../shared/config/custdetails.config';
import { Button } from 'bootstrap';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { SummaryHelper } from '../../../../utils/summaryHelper';



@Component({
  selector: 'app-summaryinfo',
  imports: [CommonModule, ReactiveFormsModule, Inputfield, Buttons],
  standalone: true,
  templateUrl: './summaryinfo.html',
  styleUrl: './summaryinfo.scss'
})
export class Summaryinfo {

  openIndex: number[] = [0];
  accordions = [
    { title: 'General Info', alwaysOpen: true },
    { title: 'Estimated Expense', alwaysOpen: false, amount: 0 },
    { title: 'Additional Info', alwaysOpen: false },
    { title: 'KYC', alwaysOpen: true },
    { title: 'Education Details', alwaysOpen: false },
    { title: 'Income Details', alwaysOpen: true },
    { title: 'Assets', alwaysOpen: false, amount: 0 },
    { title: 'Liabilities', alwaysOpen: true, amount: 0 },
    { title: 'Monthly Expenditure', alwaysOpen: false, amount: 0 },
    { title: 'Reference', alwaysOpen: true },
  ];
  summaryForm!: FormGroup;



  currentOccupation = '';
  courseDetailsFields: { label: string; value: any }[] = [];

  // estimatedExpense 

  educationFees: { tuitionInr: number; tuitionAud: number } | null = null;
  livingExpenses: Array<{
    isGroup?: any;
    children?: any;
    name: string;
    frequency: string;
    amountInr: number;
    amountAud: number;
    description?: string;

  }> = [];

  miscellaneousExpenses: Array<{
    name: string;
    frequency: string;
    amountInr: number;
    amountAud: number;
    description?: string;
    isGroup?: any;
    children?: any;
  }> = [];
  totalEstimatedExpenseInr: any;
  totalEstimatedExpenseAud: any;
  totalassetsval: any;
  totalliabilities: any;
  totalMonthlyExpenditure: any;
  totalMiscellaneousExpense: any;
  totalLivingExpense: any;


  additionalInfoFields: any = {
    mainApplicant: [],
    spouse: [],
    father: [],
    mother: []
  };
  otherFields = otherFields;
  applicationId: any;



  KycInfoFields: any = {
    identityAndResidency: [],
    permanentAddress: [],
    currentAddress: [],

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

  qualificationDetail: any = {
    QualificationDetails: [],
  };

  EducationInfoFields: any = {
    tenth: [],
    twelfth: [],
    diploma: [],
    bachelors: [],
    postgraduate: [],
    ieltsPte: [],
    offerLetter: []

  };
  educationSections = [
    { title: '10th', key: 'tenth' },
    { title: '12th', key: 'twelfth' },
    { title: 'Diploma', key: 'diploma' },
    { title: 'Undergraduate', key: 'bachelors' },
    { title: 'Postgraduate', key: 'postgraduate' },
  ];


  ReferenceInfoFields: any = {


  };

  filteredAccordions: any[] = [];
  showIncome = false;
  showAssets = false;

  constructor(private fb: FormBuilder, private formSvc: Loanformservice, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicationId = params['applicationId'];
        this.getSummarydetails()
      }
    });


    this.buildForm();
  }



  trackByKey(index: number, field: any) {
    return field.key;
  }

  buildForm() {
    const group: { [key: string]: FormControl } = {};
    this.summaryForm = new FormGroup(group);
  }
  toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    this.cd.detectChanges();
  }


  getSummarydetails() {
    this.formSvc.getSummary(this.applicationId).subscribe(
      (res: any) => {
        if (res && res.status === 'success' && res.data) {
          const data = res.data;
          this.totalEstimatedExpenseAud = data.totalEstimatedExpenseAud;
          this.totalEstimatedExpenseInr = data.totalEstimatedExpenseInr;
          this.accordions[1].amount = this.totalEstimatedExpenseInr;


          // Use helper methods to extract data
          const generalInfoData = SummaryHelper.extractGeneralInfo(data.generalInfo);
          this.currentOccupation = generalInfoData.currentOccupation;
          this.courseDetailsFields = generalInfoData.courseDetailsFields;
          this.isasset = this.courseDetailsFields.some((field: any) => field.label === 'Do you have Assets?' && field.value === 'Yes');

          const occupation = this.currentOccupation?.toLowerCase();

          this.showIncome =
            occupation === 'employed' ||
            occupation === 'self employed';

          this.showAssets =
            this.isasset === true &&
            occupation !== 'housewife' &&
            occupation !== 'housewife / homemaker';

          this.filteredAccordions = this.accordions.filter(acc => {

            if (acc.title === 'Income Details' && !this.showIncome) return false;

            if (acc.title === 'Assets' && !this.showAssets) return false;

            return true;
          });



          // Extract Estimated Expense
          const estimatedExpenseData = SummaryHelper.extractEstimatedExpense(data.estimatedExpense);
          this.educationFees = estimatedExpenseData.educationFees;
          this.livingExpenses = estimatedExpenseData.livingExpenses;
          this.miscellaneousExpenses = estimatedExpenseData.miscellaneousExpenses;
          this.totalLivingExpense = data.estimatedExpense.totalLivingExpense;
          this.totalMiscellaneousExpense = data.estimatedExpense.totalMiscExpense;



          const additionalInfoData = SummaryHelper.extractAdditionalInfo(data.additionalInfo);
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


          this.monthlyExpenditure = res.data.monthlyExpenditure || this.monthlyExpenditure;

          const allFields = [
            { key: 'rentHomeMaintenance', label: 'Rent / Home Maintenance' },
            { key: 'groceriesHousehold', label: 'Groceries and Household' },
            { key: 'utilitiesElectricityWaterGas', label: 'Utilities / Bills (Electricity, Water, Gas)' },
            { key: 'transportation', label: 'Transportation' },
            { key: 'schoolEducationFees', label: 'School Education Fees' },
            { key: 'medicalMedicines', label: 'Medical / Medicines' },
            //  { key: 'otherRecurringExpenses', label: 'Other Recurring Expenses' }
          ];

          this.monthlyExpenditureFields = allFields.filter(field => this.monthlyExpenditure[field.key] != null);
          this.totalMonthlyExpenditure = res.data.monthlyExpenditure.totalMonthlyInr;
          this.accordions[8].amount = this.totalMonthlyExpenditure;


          this.assetsSections = SummaryHelper.extractAssetsInfo(res.data.assets);
          console.log("assetsSections",this.assetsSections);
          
          this.totalassetsval = res.data.assets.totalAssets;
          this.accordions[6].amount = this.totalassetsval;


          this.liabilitiesSections = SummaryHelper.extractLiabilitiesInfo(res.data.liabilities);
          this.totalliabilities = res.data.liabilities.totalLiabilities;
          this.accordions[7].amount = this.totalliabilities;

          const qualificationInfoData = SummaryHelper.extractQualificationInfo(data.qualificationDetail);
          this.qualificationDetail = qualificationInfoData;

          const educationInfoData = SummaryHelper.extractEducationInfo(data.educationDetails);
          this.EducationInfoFields = educationInfoData;
          this.educationSections = this.educationSections.filter(section => {
            const fields = this.EducationInfoFields[section.key];

            // return fields?.some((field: any) => field.value && field.value !== '-');
            return fields?.some((field: any) => {
              if (field.key === 'marksheetUrl') {
                return Array.isArray(field.value) && field.value.length > 0;
              }
              return field.value && field.value !== '-';
            });
          });



          const ReferenceInfoData = SummaryHelper.extractReferenceInfo(data.references);
          this.ReferenceInfoFields = ReferenceInfoData;

          this.cd.detectChanges();
        }
      },
      (error) => {
        console.error('Error fetching summary details:', error);
      }
    );
  }


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

  submit() {
  }
}