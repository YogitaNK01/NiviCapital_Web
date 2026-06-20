import { Injectable } from '@angular/core';
import { Loanstepperservice } from './loanstepperservice';

@Injectable({
  providedIn: 'root'
})
export class Storage {
  
constructor(private stepperService:Loanstepperservice){}
  //----------separte key storage for main and coapplicant--------------------------------------

  getStorageKey1(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    
  ): string {
    const mainApplicantId = this.stepperService.getLoanId()?.[0];
    const index = this.stepperService.getCurrentCoApplicantIndex();

    return isCoApplicant
      ? `${section}_coapp_${applicationId}_${index}`
      : `${section}_main_${applicationId}_${mainApplicantId || applicantId}`;
  }
getStorageKey(
  section: string,
  applicationId: string,
  applicantId: string,
  isCoApplicant: boolean,
  mainApplicantId?: string,
  coApplicantId?: string,
  coApplicantIndex?: number
): string {
  if (isCoApplicant) {
    return coApplicantId
      ? `${section}_coapp_${applicationId}_${coApplicantId}`
      : `${section}_coapp_${applicationId}_temp_${coApplicantIndex}`;
  }

  return `${section}_main_${applicationId}_${mainApplicantId || applicantId}`;
}

  getPossibleStorageKeys(
  section: string,
  applicationId: string,
  applicantId: string,
  isCoApplicant: boolean,
  mainApplicantId?: string,
  coApplicantId?: string,
  coApplicantIndex?: number
): string[] {
  if (!isCoApplicant) {
    return [
      `${section}_main_${applicationId}_${mainApplicantId || applicantId}`,
      `${section}_main_${applicantId}`
    ].filter(Boolean);
  }

  return [
    `${section}_coapp_${applicationId}_${coApplicantId}`,         // preferred stable key
    `${section}_coapp_${applicationId}_temp_${coApplicantIndex}`, // pre-CIF old temp key
    `${section}_coapp_${applicationId}_${coApplicantIndex}`,      // old index-based key
    `${section}_coapp_${coApplicantId}`,
    `${section}_coapp_${coApplicantIndex}`
  ].filter(Boolean);
}

  getStoredSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean
  ): any {
    const keys = this.getPossibleStorageKeys(
      section,
      applicationId,
      applicantId,
      isCoApplicant
    );

    for (const key of keys) {
      const raw = localStorage.getItem(key);

      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (error) {
          console.error(`Invalid JSON in localStorage for key: ${key}`, error);
          return null;
        }
      }
    }

    return null;
  }

  saveSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    data: any
  ): void {
    const key = this.getStorageKey(section, applicationId, applicantId, isCoApplicant);
    localStorage.setItem(key, JSON.stringify(data));
  }

  removeSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean
  ): void {
    const possibleKeys = this.getPossibleStorageKeys(
      section,
      applicationId,
      applicantId,
      isCoApplicant
    );

    possibleKeys.forEach(key => localStorage.removeItem(key));
  }

  removeAllCoApplicantSectionData(applicationId: string, index: number, coApplicantId?: string): void {
    const sections = [
      'basicInfo',
      'generalInfo',
      'additionalinfo',
      'kycinfo',
      'assetsinfo',
      'liabilitiesinfo',
      'monthlyexpinfo',
      'incomeinfo',
      'summaryinfo'
    ];

    const possibleIds = [
      `${index}`,
      `temp_${index}`,
      coApplicantId || ''
    ].filter(Boolean);

    sections.forEach(section => {
      possibleIds.forEach(id => {
        localStorage.removeItem(`${section}_coapp_${applicationId}_${id}`);
        localStorage.removeItem(`${section}_coapp_${id}`);
      });
    });
  }

}
