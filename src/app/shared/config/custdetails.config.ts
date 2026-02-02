const piFields11  = [
    { label: 'First Name', key: 'firstName', type: 'text' },
  { label: 'Middle Name', key: 'middleName', type: 'text' },
  { label: 'Last Name', key: 'lastName', type: 'text' },
  { label: 'Date of Birth', key: 'dob', type: 'date' },
  { label: 'Marital Status', key: 'maritalStatus', type: 'text' },
  { label: 'Gender', key: 'gender', type: 'text' },
  { label: 'Nationality', key: 'nationality', type: 'text' },
  { label: 'Email ID', key: 'email', type: 'email' },
  { label: 'Mobile Number', key: 'phoneNumber', type: 'tel' }
]

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

  


export { piFields };