import { Type } from '@angular/core';
import { Loandetails } from '../../features/admin/tabs/loandetails/loandetails';
import { Education } from '../../features/admin/tabs/education/education';
import { Occupation } from '../../features/admin/tabs/occupation/occupation';
import { Assets } from '../../features/admin/tabs/assets/assets';
import { Monthlyexp } from '../../features/admin/tabs/monthlyexp/monthlyexp';
import { EstExpense } from '../../features/admin/tabs/est-expense/est-expense';
import { ProductData } from '../../features/admin/tabs/product-data/product-data';
import { Creditscore } from '../../features/admin/tabs/creditscore/creditscore';
import { Coapplicant } from '../../features/admin/tabs/coapplicant/coapplicant';
import { Summary } from '../../features/admin/tabs/summary/summary';
import { Audittrail } from '../../features/admin/tabs/audittrail/audittrail';
import { PiData } from '../../features/admin/tabs/pi-data/pi-data';
import { PiiData } from '../../features/admin/tabs/pii-data/pii-data';
import { KycData } from '../../features/admin/tabs/kyc-data/kyc-data';
import { Losproduct } from '../../features/admin/tabs/losproduct/losproduct';

export class TabConfig {
  id!: string;
  label!: string;
  routeKey!: string;
  page!: Array<'losdetails' | 'customerdetails' | 'coapplicantdetails' | 'addcustomers'>;
  icon!: string;
  component!: Type<any>;
}

export const TAB_CONFIG: TabConfig[] = [

  {
    label: 'PI', icon: '/assets/images/sidemenu/user.svg',
    id: 'pi', page: ['customerdetails','coapplicantdetails','addcustomers'],
    routeKey: "pi",
    component: PiData
  },
  {
    label: 'PII', icon: '/assets/images/sidemenu/user.svg',
    id: 'pii', page: ['customerdetails','coapplicantdetails','addcustomers'],
    routeKey: "pii",
    component: PiiData
  },
  {
    label: 'KYC Details', icon: '/assets/images/sidemenu/user.svg',
    id: 'kyc', page: ['customerdetails','coapplicantdetails','addcustomers'],
    routeKey: "kyc",
    component: KycData
  },
  {
    label: 'Products', icon: '/assets/images/sidemenu/user.svg',
    id: 'products', page: ['customerdetails'],
    routeKey: "products",
    component: ProductData
  },

  //los details
  {
    label: 'Loan Details', icon: '/assets/images/sidemenu/user.svg',
    id: 'loan', page: ['losdetails'],
    routeKey: "loan",
    component: Loandetails 
  },
  {
    label: 'Education', icon: '/assets/images/sidemenu/user.svg',
    id: 'education', page: ['losdetails','addcustomers'],
    routeKey: "education",
    component: Education
  },
  {
    label: 'Occupation', icon: '/assets/images/sidemenu/user.svg',
    id: 'occupation', page: ['losdetails','coapplicantdetails','addcustomers'],
    routeKey: "occupation",
    component: Occupation
  },
  {
    label: 'Assets and Liabilities', icon: '/assets/images/sidemenu/user.svg',
    id: 'assets', page: ['losdetails','coapplicantdetails','addcustomers'],
    routeKey: "assets",
    component: Assets
  },
  {
    label: 'Monthly Expenditure', icon: '/assets/images/sidemenu/user.svg',
    id: 'expenditure', page: ['losdetails','coapplicantdetails','addcustomers'],
    routeKey: "expenditure",
    component: Monthlyexp
  },
  {
    label: 'Estimated Expense', icon: '/assets/images/sidemenu/user.svg',
    id: 'estimate', page: ['losdetails'],
    routeKey: "estimate",
    component: EstExpense
  },
  {
    label: 'Products', icon: '/assets/images/sidemenu/user.svg',
    id: 'products', page: ['losdetails','coapplicantdetails'],
    routeKey: "products",
    component: Losproduct
  },
  {
    label: 'Credit Score', icon: '/assets/images/sidemenu/user.svg',
    id: 'credit', page: ['losdetails','coapplicantdetails'],
    routeKey: "credit",
    component: Creditscore
  },
  {
    label: 'Co-Applicant Details', icon: '/assets/images/sidemenu/user.svg',
    id: 'coapplicant', page: ['losdetails'],
    routeKey: "coapplicant",
    component: Coapplicant
  },
  {
    label: 'Summary', icon: '/assets/images/sidemenu/user.svg',
    id: 'summary', page: ['losdetails'],
    routeKey: "summary",
    component: Summary
  },
  {
    label: 'Audit Trail', icon: '/assets/images/sidemenu/user.svg',
    id: 'audit', page: ['losdetails'],
    routeKey: "audit",
    component: Audittrail
  },

  
];