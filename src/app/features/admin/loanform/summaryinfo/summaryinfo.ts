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
  imports: [CommonModule, ReactiveFormsModule,Inputfield,Buttons],
  standalone: true,
  templateUrl: './summaryinfo.html',
  styleUrl: './summaryinfo.scss'
})
export class Summaryinfo {

  openIndex: number[] = [0];
  accordions = [
    { title: 'General', alwaysOpen: true },
    { title: 'Estimated Expense', alwaysOpen: false },
    { title: 'Additional Info', alwaysOpen: false },
    { title: 'KYC', alwaysOpen: true },
    { title: 'Education Details', alwaysOpen: false },
    { title: 'Income Details', alwaysOpen: true },
    { title: 'Assets', alwaysOpen: false },
    { title: 'Liabilities', alwaysOpen: true },
    { title: 'Monthly Expenditure', alwaysOpen: false },
    { title: 'Reference', alwaysOpen: true },
  ];
  summaryForm!: FormGroup;



currentOccupation = '';
courseDetailsFields: { label: string; value: any }[] = [];



// estimatedExpense 

educationFees: { tuitionInr: number; tuitionAud: number } | null = null;

livingExpenses: Array<{
  name: string;
  frequency: string;
  amountInr: number;
  amountAud: number;
}> = [];

miscellaneousExpenses: Array<{
  name: string;
  frequency: string;
  amountInr: number;
  amountAud: number;
}> = [];



additionalInfoFields: any = {
  mainApplicant: [],
  spouse: [],
  father: [],
  mother: []
};
  otherFields = otherFields;
    applicationId: any;



    documentTypes = [
  { key: 'salarySlips', label: 'Salary Slip' },
  { key: 'form16', label: 'Form 16' },
  { key: 'bankStatements', label: 'Bank Statement' },
  { key: 'itrs', label: 'ITR' }
];

incomeDetails: any = {
  editUrl: '',
  salarySlips: [],
  bankStatements: [],
  form16: [],
  itrs: []
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
  otherRecurringExpenses: []
};

// Define the dynamic fields array for iteration in template
monthlyExpenditureFields = [
  { key: 'rentHomeMaintenance', label: 'Rent / Home Maintenance' },
  { key: 'groceriesHousehold', label: 'Groceries and Household' },
  { key: 'utilitiesElectricityWaterGas', label: 'Utilities / Bills (Electricity, Water, Gas)' },
  { key: 'transportation', label: 'Transportation' },
  { key: 'schoolEducationFees', label: 'School Education Fees' },
  { key: 'medicalMedicines', label: 'Medical / Medicines' }
];



assetsSections: any[] = [];
liabilitiesSections: any[] = [];


  constructor(private fb: FormBuilder,  private formSvc: Loanformservice,private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }

  ngOnInit(): void {

this.route.queryParams.subscribe(params => {
      if (params['applicantId']) {
        this.applicationId = params['applicationId'];
                  //this.applicationId ="c6c3cb1d-4036-4903-8c95-fc4ae7e45031";
                    // this.applicationId ="008aeaea-2b34-40cd-a040-65ef150726f7";

        

      }
    });

    this.getSummarydetails()
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

          // Use helper methods to extract data
          const generalInfoData = SummaryHelper.extractGeneralInfo(data.generalInfo);
          this.currentOccupation = generalInfoData.currentOccupation;
          this.courseDetailsFields = generalInfoData.courseDetailsFields;



          // Extract Estimated Expense
        const estimatedExpenseData = SummaryHelper.extractEstimatedExpense(data.estimatedExpense);
        this.educationFees = estimatedExpenseData.educationFees;
        this.livingExpenses = estimatedExpenseData.livingExpenses;
        this.miscellaneousExpenses = estimatedExpenseData.miscellaneousExpenses;

      

        const additionalInfoData = SummaryHelper.extractAdditionalInfo(data.additionalInfo);
          this.additionalInfoFields = additionalInfoData;

        this.incomeDetails = data.incomeDetails || {
          editUrl: '',
          salarySlips: [],
          bankStatements: [],
          form16: [],
          itrs: []
        };


        this.monthlyExpenditure = res.data.monthlyExpenditure || this.monthlyExpenditure;

      const allFields = [
        { key: 'rentHomeMaintenance', label: 'Rent / Home Maintenance' },
        { key: 'groceriesHousehold', label: 'Groceries and Household' },
        { key: 'utilitiesElectricityWaterGas', label: 'Utilities / Bills (Electricity, Water, Gas)' },
        { key: 'transportation', label: 'Transportation' },
        { key: 'schoolEducationFees', label: 'School Education Fees' },
        { key: 'medicalMedicines', label: 'Medical / Medicines' }
      ];

      this.monthlyExpenditureFields = allFields.filter(field => this.monthlyExpenditure[field.key] != null);



       this.assetsSections = SummaryHelper.extractAssetsInfo(res.data.assets);

    
        this.liabilitiesSections =SummaryHelper.extractLiabilitiesInfo(res.data.liabilities);



          // Similarly for other sections:
          // this.estimatedExpense = estimatedExpenseData;

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







  submit() {
  }
}