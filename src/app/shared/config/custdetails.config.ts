//PI data
const piFields = [
  { label: 'First Name', key: 'firstName', type: 'text', controlType: 'input' },
  { label: 'Middle Name', key: 'middleName', type: 'text', controlType: 'input' },
  { label: 'Last Name', key: 'lastName', type: 'text', controlType: 'input' },
  { label: 'Date of Birth', key: 'dob', type: 'date', controlType: 'date' },

  {
    label: 'Marital Status',
    key: 'maritalStatus',
    controlType: 'select',
    options: ['Single', 'Married', 'Divorced']
  },
  {
    label: 'Gender',
    key: 'gender',
    controlType: 'select',
    options: ['Male', 'Female', 'Other']
  },
  {
    label: 'Nationality',
    key: 'nationality',
    controlType: 'select',
    options: ['Indian', 'NRI', 'Other']
  },

  { label: 'Email ID', key: 'email', type: 'email', controlType: 'input' },
  { label: 'Mobile Number', key: 'phoneNumber', type: 'tel', controlType: 'input' }
];

const otherFields = [
  { label: 'First Name', key: 'firstName', type: 'text', controlType: 'input' },
  { label: 'Middle Name', key: 'middleName', type: 'text', controlType: 'input' },
  { label: 'Last Name', key: 'lastName', type: 'text', controlType: 'input' }
];
//pii data 
const identity = [
  { label: 'Aadhaar Number', key: 'aadhaarNumber', type: 'text', controlType: 'input' },
  { label: 'Pan Number', key: 'panNumber', type: 'text', controlType: 'input' },
  { label: 'Passport', key: 'panNumber', type: 'text', controlType: 'input' }
];

const address = [
  { label: 'Address Line 1', key: 'firstName', type: 'text', controlType: 'input' },
  { label: 'Address Line 2', key: 'middleName', type: 'text', controlType: 'input' },
  {
    label: 'Country',
    key: 'country',
    controlType: 'select',
    options: ['India']
  },
  {
    label: 'State',
    key: 'state',
    controlType: 'select',
    options: ['A', 'B', 'C']
  },
  {
    label: 'City',
    key: 'city',
    controlType: 'select',
    options: ['A', 'B', 'C']
  },

  { label: 'ZipCode', key: 'zipCode', type: 'text', controlType: 'input' }
];


// common-education-fields.ts
export const COMMON_EDUCATION_FIELDS = [
  { label: 'Institute Name', key: 'instituteName' },
  { label: 'Other Institute Name', key: 'otherInstituteName' },
  { label: 'Year of Passing', key: 'yearOfPassing' },
  { label: 'Percentage / CGPA', key: 'percentageOrCgpa' },
  { label: 'Location', key: 'location' },
  { label: 'Other Location', key: 'otherLocationName' },
  { label: 'Marksheet', key: 'marksheetUrl' },
  { label: 'Leaving Certificate', key: 'leavingCertificateUrl' },
  { label: 'Other Document Name', key: 'title' },
  { label: 'Other Document', key: 'otherDocumentUrl' },
];

//income section key for route pass

export const INCOME_SECTION_KEYS = [
  'BATCH_UPLOAD_INCOME_LAST_3_MONTHS',
  'BATCH_UPLOAD_INCOME_FORM_16',
  'BATCH_UPLOAD_INCOME_BANK_STATEMENT_1_YEAR',
  'BATCH_UPLOAD_INCOME_BANK_ITR_LAST_3_YEARS',
  'BATCH_UPLOAD_BUSINESS_FINANCE_3_YEARS',
  'BATCH_UPLOAD_BUSINESS_ITR_3_YEARS',
  'BATCH_UPLOAD_BUSINESS_GST_1_YEAR',
  'BATCH_UPLOAD_BUSINESS_BANK_STATEMENT_1_YEAR',

] as const;
export const EDUCATION_SECTION_KEYS = [
  'SAVE_LAST_QUALIFICATION',
  'BATCH_UPLOAD_10',
  'BATCH_UPLOAD_12',
  'BATCH_UPLOAD_DIPLOMA',
  'BATCH_UPLOAD_DIPLOMA',
  'BATCH_UPLOAD_UNDERGRADUATE',
  'BATCH_UPLOAD_POSTGRADUATE',
  'BATCH_UPLOAD_IELTS_PTE',
  'BATCH_UPLOAD_OFFER_LETTER',
  'BATCH_UPLOAD_12',
  'BATCH_UPLOAD_DIPLOMA'
];
export { piFields, otherFields, identity, address };