export class SummaryHelper {

  static extractGeneralInfo(generalInfo: any) {
    if (!generalInfo) return { currentOccupation: '', courseDetailsFields: [] };

    const currentOccupation = generalInfo.occupationInfo?.occupation || '';

    const course = generalInfo.courseDetails || {};
    const courseDetailsFields = [
      { label: 'Country', value: course.country || '' },
      { label: 'State', value: course.state || '' },
      { label: 'University Name', value: course.universityName || '' },
      { label: 'Course Type', value: course.courseType || '' },
      // { label: 'Duration (Years)', value: course.durationYears != null ? course.durationYears : '' },
      { label: 'Course Name', value: course.courseName || '' },
      { label: 'Course Start Date', value: course.startDate || '' },
      { label: 'Course End Date', value: course.endDate || '' },
      { label: 'Do you have Assets?', value: course.endDate || '' },
      { label: 'Lending Partner', value: course.lendingPartner || '' }
    ];

    return { currentOccupation, courseDetailsFields };
  }


  static extractEstimatedExpense(estimatedExpense: any) {
    if (!estimatedExpense) return {
      educationFees: null,
      livingExpenses: [],
      miscellaneousExpenses: []
    };

    return {
      educationFees: estimatedExpense.educationFees || null,
      livingExpenses: Array.isArray(estimatedExpense.livingExpenses) ? estimatedExpense.livingExpenses : [],
      miscellaneousExpenses: Array.isArray(estimatedExpense.miscellaneousExpenses) ? estimatedExpense.miscellaneousExpenses : []
    };
  }


  static extractAdditionalInfo(additionalInfo: any) {
    // Define labels for each section
    const labels = {
      mainApplicant: [
        { label: 'Gender', key: 'gender' },
        { label: 'Marital Status', key: 'maritalStatus' },
        { label: 'Upload Applicant Photo', key: 'photoUrl' },
        { label: 'Number of Dependents', key: 'numberOfDependents' }
      ],
      spouse: [
        { label: 'First Name', key: 'firstName' },
        { label: 'Middle Name', key: 'middleName' },
        { label: 'Last Name', key: 'lastName' }
      ],
      father: [
        { label: 'First Name', key: 'firstName' },
        { label: 'Middle Name', key: 'middleName' },
        { label: 'Last Name', key: 'lastName' }
      ],
      mother: [
        { label: 'First Name', key: 'firstName' },
        { label: 'Middle Name', key: 'middleName' },
        { label: 'Last Name', key: 'lastName' }
      ]
    };

    // Helper function to safely get value or fallback
    const getValue = (obj: any, key: string) => {
      if (!obj) return '-';
      if (key === 'photoUrl') {
        return obj[key] ? 'Photo.jpg' : 'No Photo';
      }
      return obj[key] || '-';
    };

    // Extract values for each section based on labels
    const values = {
      mainApplicant: labels.mainApplicant.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.mainApplicant, field.key)
      })),
      spouse: labels.spouse.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.spouse, field.key)
      })),
      father: labels.father.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.father, field.key)
      })),
      mother: labels.mother.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.mother, field.key)
      }))
    };

    return values;
  }



  static extractKYCInfo(kycInfo: any) {
    const labels = {
      identityAndResidency: [
        { label: 'Aadhaar Number', key: 'aadhaarNumber' },
        { label: 'Aadhaar Card Front', key: 'aadhaarFrontUrl' },
        { label: 'Aadhaar Card Back', key: 'aadhaarBackUrl' },
        { label: 'PAN Number', key: 'panNumber' },
        { label: 'PAN Card', key: 'panCardUrl' },
        { label: 'Passport', key: 'passportNumber' },
        { label: 'Passport ', key: 'passportUrl' },
        { label: 'Date Of Birth', key: 'dob' }
      ],
      permanentAddress: [
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },

      ],
      currentAddress: [
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],
      otherAddress: [
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],

    };

    // Helper function to safely get value or fallback
    const getValue = (obj: any, key: string) => {
      if (!obj) return '-';
      if (key.includes('url')) {
        return obj[key] ? 'Photo.jpg' : 'No Photo';
      }
      return obj[key] || '-';
    };

    // Extract values for each section based on labels
    const values = {
      identityAndResidency: labels.identityAndResidency.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.identityAndResidency, field.key)
      })),
      permanentAddress: labels.permanentAddress.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.permanentAddress, field.key)
      })),
      currentAddress: labels.currentAddress.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.currentAddress, field.key)
      })),
      otherAddress: labels.currentAddress.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.currentAddress, field.key)
      })),

    };

    return values;

  }

  static extractEducationInfo(kycInfo: any) {
    const labels = {
      QualificationDetails: [
        { label: 'Last Qualification', key: 'aadhaarNumber' },
        { label: 'Other Qualification', key: 'aadhaarFrontUrl' },
        { label: 'Last Institution Name', key: 'aadhaarBackUrl' },
        { label: 'Other Institution Name', key: 'panNumber' },

      ],
      permanentAddress: [
        { label: 'Institute Name', key: 'addressLine' },
        { label: 'Other Institute Name', key: 'addressLine1' },
        { label: 'Year of Passing', key: 'addressLine2' },
        { label: 'Percentage / CGPA', key: 'city' },
        { label: 'Location', key: 'state' },
        { label: 'Other Location', key: 'country' },
        { label: 'Marksheet', key: 'pincode' },
        { label: 'Leaving Certificate', key: 'pincode' },
        { label: 'Other Document Name', key: 'pincode' },
        { label: 'Other Document ', key: 'pincode' },


      ],
      IELTSPTE: [
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],
      UniversityOfferLetter: [
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],

    };

    // Helper function to safely get value or fallback
    const getValue = (obj: any, key: string) => {
      if (!obj) return '-';
      if (key.includes('url')) {
        return obj[key] ? 'Photo.jpg' : 'No Photo';
      }
      return obj[key] || '-';
    };

    // Extract values for each section based on labels
    const values = {
      identityAndResidency: labels.QualificationDetails.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.identityAndResidency, field.key)
      })),
     
      IELTSPTE: labels.IELTSPTE.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.IELTSPTE, field.key)
      })),
      UniversityOfferLetter: labels.UniversityOfferLetter.map(field => ({
        label: field.label,
        value: getValue(kycInfo?.UniversityOfferLetter, field.key)
      })),

    };

    return values;

  }
  static extractLiabilitiesInfo(liabilities: any) {
    if (!liabilities) return [];

    const sections: any[] = [];

    /* ================= EXISTING LOANS ================= */
    if (liabilities.existingLoans?.length) {
      sections.push({
        sectionLabel: 'Existing Loans',
        cards: liabilities.existingLoans.map((loan: any, i: number) => ({
          title: `Home Loan ${i + 1}`,
          fields: [
            { label: 'Bank / Lender', value: loan.bankLender },
            {
              label: 'Outstanding Balance (INR)',
              value: loan.outstandingBalanceInr,
              isCurrency: true
            },
            {
              label: 'EMI Amount (INR)',
              value: loan.emiAmountInr,
              isCurrency: true
            },
            {
              label: 'Remaining Tenure (Months)',
              value: loan.remainingTenureMonths
            }
          ]
        }))
      });
    }

    /* ================= CREDIT CARD OUTSTANDING ================= */
    if (liabilities.creditCardOutstanding?.length) {
      sections.push({
        sectionLabel: 'Credit Card Outstanding',
        cards: liabilities.creditCardOutstanding.map((cc: any, i: number) => ({
          title: `Credit Card ${i + 1}`,
          fields: [
            { label: 'Bank Name', value: cc.bankName },
            {
              label: 'Outstanding Balance (INR)',
              value: cc.outstandingBalanceInr,
              isCurrency: true
            },
            {
              label: 'Credit Limit (INR)',
              value: cc.creditLimitInr,
              isCurrency: true
            }
          ]
        }))
      });
    }

    /* ================= BNPL ================= */
    if (liabilities.bnpl?.length) {
      sections.push({
        sectionLabel: 'Buy Now Pay Later (BNPL)',
        cards: liabilities.bnpl.map((b: any, i: number) => ({
          title: `BNPL ${i + 1}`,
          fields: [
            { label: 'Lender Name', value: b.lenderName },
            {
              label: 'Outstanding Balance (INR)',
              value: b.outstandingBalanceInr,
              isCurrency: true
            },
            {
              label: 'Credit Limit (INR)',
              value: b.creditLimitInr,
              isCurrency: true
            },
            {
              label: 'Monthly EMI (INR)',
              value: b.monthlyEmiInr,
              isCurrency: true
            }
          ]
        }))
      });
    }

    /* ================= OTHER LIABILITIES ================= */
    if (liabilities.otherLiabilities?.length) {
      sections.push({
        sectionLabel: 'Other Liabilities',
        cards: liabilities.otherLiabilities.map((o: any, i: number) => ({
          title: `Liability ${i + 1}`,
          fields: [
            { label: 'Liability Type', value: o.liabilityType },
            {
              label: 'Amount (INR)',
              value: o.amountInr,
              isCurrency: true
            },
            {
              label: 'Monthly Repayment (INR)',
              value: o.monthlyRepaymentInr,
              isCurrency: true
            }
          ]
        }))
      });
    }

    return sections;
  }


  static extractAssetsInfo(assets: any) {
    if (!assets) return [];

    const sections: any[] = [];

    /* ---------- GOLD ---------- */
    if (assets.gold?.length) {
      sections.push({
        sectionLabel: 'Gold',
        cards: [
          {
            fields: [
              { label: 'Value (INR)', value: assets.gold[0].valueInr, isCurrency: true }
            ]
          }
        ]
      });
    }

    /* ---------- LIQUID ASSETS ---------- */
    if (assets.liquidAssets?.length) {
      sections.push({
        sectionLabel: 'Liquid Assets',
        cards: [
          {
            fields: assets.liquidAssets.map((l: any) => ({
              label: `${l.assetType} `,
              value: l.amountInr,
              isCurrency: true
            }))
          },
          {
            fields: assets.liquidAssets.map((l: any) => ({
              label: `${l.assetType} `,
              value: l.amountInr,
              isCurrency: true
            }))
          }
        ]
      });
    }

    /* ---------- PROPERTY ---------- */
    if (assets.properties?.length) {
      sections.push({
        sectionLabel: 'Property / Land Assets',
        cards: assets.properties.map((p: any, i: number) => ({
          title: `Property ${i + 1}`,
          fields: [
            { label: 'Property Type', value: p.propertyType },
            { label: 'Ownership Type', value: p.ownershipType },
            { label: 'Market Value (INR)', value: p.marketValueInr, isCurrency: true },
            { label: 'Location / Address', value: p.location, fullRow: true }
          ]
        }))
      });
    }

    /* ---------- FIXED DEPOSIT ---------- */
    if (assets.fixedDeposits?.length) {
      sections.push({
        sectionLabel: 'Fixed Deposit',
        cards: assets.fixedDeposits.map((fd: any, i: number) => ({
          title: `FD ${i + 1}`,
          fields: [
            { label: 'Bank Name', value: fd.bankName },
            { label: 'Amount (INR)', value: fd.amountInr, isCurrency: true },
            { label: 'Maturity Date', value: fd.maturityDate }
          ]
        }))
      });
    }

    /* ---------- INVESTMENTS ---------- */
    if (assets.investments?.length) {
      sections.push({
        sectionLabel: 'Investments',
        cards: assets.investments.map((inv: any, i: number) => ({
          title: `Investments ${i + 1}`,
          fields: [
            { label: 'Select Type', value: inv.type },
            { label: `${inv.type} (INR)`, value: inv.valueInr, isCurrency: true }
          ]
        }))
      });
    }

    return sections;
  }

  static extractReferenceInfo(additionalInfo: any) {
    // Define labels for each section
    const labels = {

      Reference1: [
        { label: 'First Name', key: 'firstName' },
        { label: 'Middle Name', key: 'middleName' },
        { label: 'Last Name', key: 'lastName' },
        { label: 'Email Id', key: 'email' },
        { label: 'Mobile Number', key: 'phone' },
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],
      Reference2: [
        { label: 'First Name', key: 'firstName' },
        { label: 'Middle Name', key: 'middleName' },
        { label: 'Last Name', key: 'lastName' },
        { label: 'Email Id', key: 'email' },
        { label: 'Mobile Number', key: 'phone' },
        { label: 'Address Line 1', key: 'addressLine' },
        { label: 'Address Line 2', key: 'addressLine1' },
        { label: 'Address Line 3', key: 'addressLine2' },
        { label: 'City', key: 'city' },
        { label: 'state', key: 'state' },
        { label: 'Country', key: 'country' },
        { label: 'Pincode', key: 'pincode' },
      ],

    };

    // Helper function to safely get value or fallback
    const getValue = (obj: any, key: string) => {
      if (!obj) return '-';
      if (key === 'photoUrl') {
        return obj[key] ? 'Photo.jpg' : 'No Photo';
      }
      return obj[key] || '-';
    };

    // Extract values for each section based on labels
    const values = {

      Reference1: labels.Reference1.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.Reference1, field.key)
      })),
      Reference2: labels.Reference2.map(field => ({
        label: field.label,
        value: getValue(additionalInfo?.Reference2, field.key)
      })),

    };

    return values;
  }


  static toTitleCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_\-]/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
      .trim();
  }

}
