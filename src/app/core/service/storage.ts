import { Injectable } from '@angular/core';
import { Loanstepperservice } from './loanstepperservice';

@Injectable({
  providedIn: 'root'
})
export class Storage {
  
constructor(private stepperService:Loanstepperservice){}
  //----------separte key storage for main and coapplicant--------------------------------------

  
private getCurrentContext(
  
 applicationId: string,
  applicantId: string,
  isCoApplicant: boolean,
  explicit?: {
    mainApplicantId?: string;
    coApplicantId?: string | null;
    coApplicantIndex?: number | null;
  }
) {
  let sessionCoApp: any = {};

  try {
    sessionCoApp = JSON.parse(sessionStorage.getItem('coAppIds') || '{}');
  } catch {
    sessionCoApp = {};
  }

  const mainApplicantId =
    explicit?.mainApplicantId ||
    this.stepperService.getLoanId()?.[0] ||
    '';

  const coApplicantId = isCoApplicant
    ? (
        explicit?.coApplicantId ??  applicantId ??
        this.stepperService.getCo_appId()?.[0] ??
        sessionCoApp?.applicantId ??
        null
      )
    : null;

  const coApplicantIndex = isCoApplicant
    ? (
        explicit?.coApplicantIndex ??
        this.stepperService.getCurrentCoApplicantIndex() ??
        sessionCoApp?.coApplicantIndex ??
        1
      )
    : null;

  return {
    mainApplicantId,
    coApplicantId,
    coApplicantIndex
  };
}

  getStorageKey(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    explicit?: {
      mainApplicantId?: string;
      coApplicantId?: string | null;
      coApplicantIndex?: number | null;
    }
  ): string {
    const { mainApplicantId, coApplicantId, coApplicantIndex } =
      this.getCurrentContext(applicationId, applicantId,isCoApplicant,explicit);


  // const mainApplicantId =
  //   explicit?.mainApplicantId || this.stepperService.getLoanId()?.[0] || '';

  // const coApplicantId =
  //   explicit?.coApplicantId ?? this.stepperService.getCo_appId()?.[0] ?? '';

  // const coApplicantIndex =
  //   explicit?.coApplicantIndex ?? this.stepperService.getCurrentCoApplicantIndex() ?? 1;


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
    explicit?: {
      mainApplicantId?: string;
      coApplicantId?: string | null;
      coApplicantIndex?: number | null;
    }
  ): string[] {
    const { mainApplicantId, coApplicantId, coApplicantIndex } =
      this.getCurrentContext(applicationId, applicantId,isCoApplicant, explicit);

    if (!isCoApplicant) {
      return [
        `${section}_main_${applicationId}_${mainApplicantId || applicantId}`,
        `${section}_main_${applicantId}`
      ].filter(Boolean);
    }

    const keys = [
      coApplicantId
        ? `${section}_coapp_${applicationId}_${coApplicantId}`
        : '',
      coApplicantIndex != null
        ? `${section}_coapp_${applicationId}_temp_${coApplicantIndex}`
        : '',
      coApplicantIndex != null
        ? `${section}_coapp_${applicationId}_${coApplicantIndex}`
        : '',
      coApplicantId
        ? `${section}_coapp_${coApplicantId}`
        : '',
      coApplicantIndex != null
        ? `${section}_coapp_${coApplicantIndex}`
        : ''
    ].filter(Boolean);

    return [...new Set(keys)];
  }

  getStoredSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    explicit?: {
      mainApplicantId?: string;
      coApplicantId?: string | null;
      coApplicantIndex?: number | null;
    }
  ): any {
    const keys = this.getPossibleStorageKeys(
      section,
      applicationId,
      applicantId,
      isCoApplicant,
      explicit
    );

    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        return JSON.parse(raw);
      } catch (error) {
        console.error(`Invalid JSON in localStorage for key: ${key}`, error);
        return null;
      }
    }

    return null;
  }

  saveSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    data: any,
    explicit?: {
      mainApplicantId?: string;
      coApplicantId?: string | null;
      coApplicantIndex?: number | null;
    }
  ): void {
    const key = this.getStorageKey(
      section,
      applicationId,
      applicantId,
      isCoApplicant,
      explicit
    );

    localStorage.setItem(key, JSON.stringify(data));
  }

  removeSectionData(
    section: string,
    applicationId: string,
    applicantId: string,
    isCoApplicant: boolean,
    explicit?: {
      mainApplicantId?: string;
      coApplicantId?: string | null;
      coApplicantIndex?: number | null;
    }
  ): void {
    const keys = this.getPossibleStorageKeys(
      section,
      applicationId,
      applicantId,
      isCoApplicant,
      explicit
    );

    keys.forEach(key => localStorage.removeItem(key));
  }

  migrateCoApplicantTempToStable(
    section: string,
    applicationId: string,
    coApplicantId: string,
    coApplicantIndex: number
  ): void {
    const tempKey = `${section}_coapp_${applicationId}_temp_${coApplicantIndex}`;
    const stableKey = `${section}_coapp_${applicationId}_${coApplicantId}`;

    const raw = localStorage.getItem(tempKey);

    if (raw) {
      localStorage.setItem(stableKey, raw);
      localStorage.removeItem(tempKey);
    }
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
