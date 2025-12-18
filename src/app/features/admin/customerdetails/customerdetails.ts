import { CommonModule } from '@angular/common';
import { Component, ElementRef, input, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { ActivatedRoute, Router } from '@angular/router';
import { Aesutil } from '../../../utils/aesutil';
import { Sanctionletter } from '../sanctionletter/sanctionletter';
import { Main } from '../../../core/service/main';
import { Quicklinks } from '../quicklinks/quicklinks';
import { FormsModule } from '@angular/forms';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Commontabs } from '../../systemdesign/commontabs/commontabs';

interface CreditStats {
  totalCredit: string;
  totalAccounts: number;
  numberOfLoans: number;
  outstandingAmount: string;
}

interface Address {
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

interface CibilHistory {
  dateGenerated: string;
  name: string;
  generatedBy: string;
  creditScore: number;
}

export interface AuditTrail {
  date: Date;
  time: string;
  action: string;
  reference: string;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-customerdetails',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, Buttons, FormsModule, Quicklinks],
  templateUrl: './customerdetails.html',
  styleUrl: './customerdetails.scss'
})
export class Customerdetails {

  selectedTabIndex = 0;
   tabIndexMap: { [key: string]: number } = {
    pi: 0,
    pii: 1,
    kyc: 2,
    products: 3,
    // products: 4,
    
  };

  userData: any;
  kycData: any;
  issalaried: Boolean = false;

  kyc_documents: any[] = [];
  edu_documents: any[] = [];
  allApplicants: any[] = [];
  selecteduser: any;
  selectedDoc: any = null;

  tenthMarksheet: any;
  tenthLC: any;
  twelthMarksheet: any;
  twelfthLC: any;
  ugMarksheet: any;
  ugLC: any;
  pgMarksheet: any;
  pgLC: any;
  pgCert: any;
  scorecard: any;
  uniofferletter: any;
  salaryslip1: any;
  salaryslip2: any;
  salaryslip3: any;
  form16: any;
  itr1: any
  itr2: any;
  itr3: any;
  bankstatement: any;
  ielts: any

  searchQuery: string = '';
  selectedFilter: string = 'all';
  auditTrails: AuditTrail[] = [];
  filteredAuditTrails: AuditTrail[] = [];


   
  @Input() creditScore = 780;

  gaugeLabels = [
    { title: 'POOR', range: '300–550' },
    { title: 'AVERAGE', range: '550–650' },
    { title: 'GOOD', range: '650–750' },
    { title: 'EXCELLENT', range: '750–900' }
  ];


  // creditScore: number = 780;
  reportDate: string = '20-06-2025';
  source: string = 'TransUnion CIBIL';

  creditStats: CreditStats = {
    totalCredit: '₹12,50,00',
    totalAccounts: 3,
    numberOfLoans: 4,
    outstandingAmount: '₹6,75,000'
  };



  cibilHistory: CibilHistory[] = [
    { dateGenerated: '25/07/2025', name: 'Vighnesh', generatedBy: 'Sandeep', creditScore: 780 },
    { dateGenerated: '22/11/2024', name: 'Vighnesh', generatedBy: 'Aarti', creditScore: 820 },
    { dateGenerated: '04/05/2024', name: 'Vighnesh', generatedBy: 'Priya', creditScore: 690 }
  ];

  

  constructor(public router: Router,public route: ActivatedRoute, private aes: Aesutil, private service: Main) { }

  async ngOnInit(): Promise<void> {

     this.route.queryParams.subscribe(params => {
      const tabKey = params['tab'];
      if (tabKey && this.tabIndexMap[tabKey] !== undefined) {
        this.selectedTabIndex = this.tabIndexMap[tabKey];
      }
    });

    

    console.log("loaded data")
    const saved = localStorage.getItem('selecteduserDetails');
    this.userData = saved ? JSON.parse(saved) : null;
    const kyc = sessionStorage.getItem('kycs');
    this.kycData = kyc ? JSON.parse(kyc) : null;
    console.log('kycData user data:', this.kycData);
    this.kyc_documents = this.kycData[0].documents;
    console.log('kycData.documents data:', this.kyc_documents);
    // this.encryptAadhar();
    // this.decryptAadhar()
    // this. getAllDocumnets();

    this.loadAuditTrails()

  }


  getAllDocumnets() {
    this.service.getUserDocuments(this.service.docofselectedUser.id).subscribe({
      next: (response) => {

        this.edu_documents = response.documents;
        console.log('all Documents:', this.edu_documents);

        //10th
        this.tenthMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === '10th' && d.type === 'MARKSHEET'
        );
        console.log('all tenthMarksheet:', this.tenthMarksheet);

        this.tenthLC = this.edu_documents.find(
          d => d.documentSubcategory === '10th' && d.type === 'LC'
        );

        //12th
        this.twelthMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === '12th' && d.type === 'MARKSHEET'
        );
        this.twelfthLC = this.edu_documents.find(
          d => d.documentSubcategory === '12th' && d.type === 'LC'
        );

        //UG
        this.ugMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === 'undergrad' && d.type === 'MARKSHEET'
        );

        this.ugLC = this.edu_documents.find(
          d => d.documentSubcategory === 'undergrad' && d.type === 'MARKSHEET'
        );

        //PG
        this.pgMarksheet = this.edu_documents.find(
          d => d.documentSubcategory === 'postgrad' && d.type === 'MARKSHEET'
        );
        this.pgCert = this.edu_documents.find(
          d => d.documentSubcategory === 'postgrad' && d.type === 'CERTIFICATE'
        );

        //scorecard 
        this.scorecard = this.edu_documents.find(
          d => d.documentSubcategory === 'ielts' && d.type === 'SCOREREPORT'
        );
        //offer letter
        this.uniofferletter = this.edu_documents.find(
          d => d.documentSubcategory === 'universityOffer' && d.type === 'UNIVERSITYOFFERLETTER'
        );

        //salaryslips
        this.salaryslip1 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip1'
        );
        this.salaryslip2 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip2'
        );
        this.salaryslip3 = this.edu_documents.find(
          d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip3'
        );

        //itr
        this.itr1 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr1'
        );
        this.itr2 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr2'
        );
        this.itr3 = this.edu_documents.find(
          d => d.documentSubcategory === 'itr' && d.type === 'Itr3'
        );

        //form16
        this.form16 = this.edu_documents.find(
          d => d.documentSubcategory === 'form16' && d.type === 'Form16'
        );

        //bankstatement
        this.bankstatement = this.edu_documents.find(
          d => d.documentSubcategory === 'statement' && d.type === 'BankStatement'
        );

        //ielts
        //  this.ielts = this.edu_documents.find(
        //   d => d.documentSubcategory === 'firstMonthSalary' && d.type === 'SalarySlip3'
        // );



      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });

  }

  downloadImage(data: any) {

    this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }

  async encryptAadhar() {
    const aadhaarNumber = 'abcde1234f'; // example input
    var result: any;
    try {
      result = await this.aes.encrypt(this.kycData[0].aadhaarNumber);
      console.log('✅ Encrypted Aadhaar:', result.ciphertext);
      console.log('🔑 IV (Base64):', result.iv);
    } catch (error) {
      console.error('Encryption failed:', error);
    }

    setTimeout(async () => {
      try {
        const decryptedAadhar = await this.aes.decrypt(result.ciphertext, result.iv);
        console.log('Decrypted Aadhaar:', decryptedAadhar);
      } catch (e) {
        console.error('Error decrypting Aadhaar:', e);
      }
    }, 5000);

  }

  async decryptAadhar() {
    const encryptedAadhar = 'FaRC2vqwGdG8Nx66B52ShPQch47vneHV0v4=';
    const ivBase64 = 'Hk9V3jvL7p7F+uPL'; // whatever IV came with it


  }


 

  ngAfterViewInit() {

  }

  ngOnDestroy() {
  }
  downloadReport(): void {
    console.log('Downloading latest report...');
    // Implement download logic here
  }

  viewDetails(history: CibilHistory): void {
    console.log('Viewing details for:', history);
    // Implement view details logic here
  }
  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }





  /****************   customer detail tabs ****************/

  // Download CIF
  downloadCIF(): void {
    // Implement download logic
    console.log('Downloading CIF for:');
  }

  // Edit customer
  editCustomer(): void {
    // Implement edit logic
    console.log('Editing customer:');
  }



  /******************************* Audit Trails************************/

  selectedOption2: string = '';
  myOptions2: DropdownOption[] = [
    { label: 'Loan', value: 'pdf', icon: '/assets/images/icons/note.svg' },
    { label: 'Forex', value: 'excel', icon: '/assets/images/icons/note.svg' },
    { label: 'Insurance', value: 'json', icon: '/assets/images/icons/note.svg' },
    { label: 'Others', value: 'others', icon: '/assets/images/icons/note.svg' }
  ];
  onSelectionChange2(value: string) {
    console.log('Selected:2', value);
  }

  loadAuditTrails() {
   
    this.auditTrails = [
      {
        date: new Date(),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Pending'
      },
      {
        date: new Date(),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Pending'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        time: '2:30 PM',
        action: 'Aadhaar Card Requested',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        time: '2:30 PM',
        action: 'PAN Card Verified',
        reference: 'Ref 28789 ABC 67455',
        status: 'Approved'
      },
      {
        date: new Date(new Date().setDate(new Date().getDate() - 7)),
        time: '11:45 AM',
        action: 'Document Upload',
        reference: 'Ref 28789 ABC 67455',
        status: 'Submitted'
      }
    ];

    this.filteredAuditTrails = [...this.auditTrails];
  }

  filterAuditTrail() {
    let filtered = [...this.auditTrails];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(trail =>
        trail.action.toLowerCase().includes(query) ||
        trail.reference.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(trail =>
        trail.status.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }

    this.filteredAuditTrails = filtered;
  }

  getTodayTrails(): AuditTrail[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() === today.getTime();
    });
  }

  getYesterdayTrails(): AuditTrail[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() === yesterday.getTime();
    });
  }

  getEarlierTrails(): AuditTrail[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return this.filteredAuditTrails.filter(trail => {
      const trailDate = new Date(trail.date);
      trailDate.setHours(0, 0, 0, 0);
      return trailDate.getTime() < yesterday.getTime();
    });
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    return `status-${statusLower}`;
  }

 
}
