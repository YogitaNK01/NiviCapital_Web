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
  { label: 'Other Institute Name', key: 'addressLine1' },
  { label: 'Year of Passing', key: 'yearOfPassing' },
  { label: 'Percentage / CGPA', key: 'percentageOrCgpa' },
  { label: 'Location', key: 'location' },
  { label: 'Other Location', key: 'otherLocation' },
  { label: 'Marksheet', key: 'marksheetUrl' },
  { label: 'Leaving Certificate', key: 'leavingCertificateUrl' },
  { label: 'Other Document Name', key: 'otherDocumentName' },
  { label: 'Other Document', key: 'otherDocumentUrl' },
];


export { piFields,otherFields,identity,address };