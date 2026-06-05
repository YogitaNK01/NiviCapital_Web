import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BehaviorSubject, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  errors: any;
  data: T;
}
interface OptionItem {
  label: string;
  value: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Loanformservice {

  form!: FormGroup;
  // private baseUrl = environment.apiBaseUrl;
  private baseUrl = "/nivicapsit/api";

  kycdetailsID: any;

  isasset: boolean = false;
  isincome: boolean = false;
  issalaried: boolean = false;
  coursetypeug: boolean = false;

  co_isasset: boolean = false;
  co_isincome: boolean = false;
  co_issalaried: boolean = false;
  co_coursetypeug: boolean = false;

  applicantState = {
    isasset: false,
    isincome: false,
    issalaried: false,
    coursetypeug: false
  };

  coApplicantState = {
    isasset: false,
    isincome: false,
    issalaried: false
  };


  loanInfoData: any;
  generalInfoData: any;
  estExpenseInfoData: any;
  additionalInfoData: any;
  kycInfoData: any;
  incomeInfoData: any;
  aseetsInfoData: any;
  liabilitiesInfoData: any;
  monthlyExpenditureData: any;
  referenceInfoData: any;
  educationdetailsData: any;
  educationInfoData: any;


  co_basicInfoData: any;
  co_generalInfoData: any;
  co_estExpenseInfoData: any;
  co_additionalInfoData: any;
  co_kycInfoData: any;
  co_incomeInfoData: any;
  co_aseetsInfoData: any;
  co_liabilitiesInfoData: any;
  co_monthlyExpenditureData: any;
  co_referenceInfoData: any;
  co_educationInfoData: any;

  coapppmobile: any;
  coappStep: number = 1

  private instituteCache: OptionItem[] | null = null;
  private instituteRequest$!: Observable<OptionItem[]>;


  summaryData: any = null;summaryLoaded = false;
  private summaryRequest$?: Observable<ApiResponse<any>>;

  constructor(private http: HttpClient,) { this.restoreFromStorage(); }


  restoreFromStorage() {
    this.isasset = JSON.parse(localStorage.getItem('isasset') || 'false');
    this.isincome = JSON.parse(localStorage.getItem('isincome') || 'false');
    this.issalaried = JSON.parse(localStorage.getItem('issalaried') || 'false');
  }

  setValues(isAsset?: boolean, isIncome?: boolean, issalaried?: boolean, coursetypeug?: boolean) {
    if (isAsset !== undefined) {
      this.isasset = isAsset;
      localStorage.setItem('isasset', JSON.stringify(isAsset));
    }

    if (isIncome !== undefined) {
      this.isincome = isIncome;
      localStorage.setItem('isincome', JSON.stringify(isIncome));
    }

    if (issalaried !== undefined) {
      this.issalaried = issalaried;
      localStorage.setItem('issalaried', JSON.stringify(issalaried));
    }

    if (coursetypeug !== undefined) {
      this.coursetypeug = coursetypeug;
      localStorage.setItem('coursetypeug', JSON.stringify(coursetypeug));
    }
  }

  // *************************Edit flow*********************************

 
isEditFlow(): boolean {
  const ctx = sessionStorage.getItem('loanContextData');
  if (!ctx) return false;

  try {
    return JSON.parse(ctx)?.edit === true;
  } catch {
    return false;
  }
}

loadSummaryIfEdit(applicationId: string,applicantId:string) {
  if (!this.isEditFlow()) return null;

  if (this.summaryLoaded && this.summaryData) {
    return null;
  }

  return this.getCoappSummary(applicationId,applicantId);
}

setSummary(data: any) {
  this.summaryData = data;
  this.summaryLoaded = true;
}

getSummarySection(section: string) {
  return this.summaryData?.[section] || null;
}



  // *************************loan info api*********************************

  submitLoanInfo(payload: any, id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/loan-detail`,
      payload
    );
  }


  //*************************  genral info apis  *************************
  getOccupations(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/occupations`,

    );
  }



  getlendingpartners(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/lending-partners`,

    );
  }

  getCoursetype(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/course-types/${id}`,

    );
  }

  getCourseName(id: string, type: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/courses/${id}/${type}`,

    );
  }

  // ************************* Australian states and cities api *************************

  getAustralianstates(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/states`,

    );
  }


  getAustralianstatescities(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/universities/${id}`,

    );
  }

  // ************************* save general info api  *************************
  submitGenralInfo(payload: any, id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/general-info`,
      payload
    );
  }

  //coapplicant genrela info 
  submit_Coapp_GenralInfo(payload: any, id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/coApp-general-info`,
      payload
    );
  }

  // ************************* additional info api  *************************

  //upload user profile photo
  uploadPhoto(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/files/upload/profile-picture`,
      payload
    );
  }

  submitAdditionalInfo(payload: any, id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/personal-info`,
      payload
    );
  }

  // ************************* save kyc info api *************************

  setKycId(id: string) {
    this.kycdetailsID = id;

  }


  getKycId() {
    return this.kycdetailsID;
  }

  uploadpassport(data: any, id: string): Observable<ApiResponse<any>> {
    console.log("service--", data);

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/kyc/${id}/documents`,
      data
    );
  }
  getKycDetails(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/kyc`,

    );
  }


  // ************************* estimate expense  *************************
  getlivingexp(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/expense-masters/living`,

    );
  }

  getmiscellaneousexp(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/expense-masters/miscellaneous`,

    );
  }

  estimateExpense(data: any, id: string): Observable<ApiResponse<any>> {
    console.log("service--", data);

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/estimated-expenses`,
      data
    );
  }


  // ************************* Income   *************************

  uploadIncome(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/documents/batch`,
      data
    );
  }

  // ************************* assets   *************************

  getAllAssets(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/asset-masters`,

    );
  }
  selectedAssets(data: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/asset-masters/group/${data}`,

    );
  }

  getAssets(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/assets`,
      data
    );
  }
  getallBanks(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/bank-list`,
    )
  };



  // ************************* Liability   *************************

  getAllLiabilities(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/liability-types`,

    );
  }
  getloan_type(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/loan-types`,

    );
  }
  getalllenders(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/lender-names`,
    )
  };

  submitliability(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/liabilities`,
      data
    );
  }

  // ************************* Monthly Expenditure   *************************
  MonthlyExpenditure(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/monthly-expenses`,
      data
    );
  }

  // *************************Education *************************


  getInstitutesCached(): Observable<OptionItem[]> {

    //  1. Return cached data if already loaded
    if (this.instituteCache) {
      return of(this.instituteCache);
    }

    //  2. If API call already in progress, reuse it
    if (this.instituteRequest$) {
      return this.instituteRequest$;
    }

    //  3. Make API call ONCE
    this.instituteRequest$ = this.http.get<any>(`${this.baseUrl}/v1/masters/institute-names`)
      .pipe(
        map(res =>
          (res.data ?? res).map((s: any) => ({
            value: s.id,
            //  value: s.instituteName,
            label: s.instituteName
          }))
        ),
        tap(data => {
          this.instituteCache = data;
        }),
        shareReplay(1)
      );

    return this.instituteRequest$;
  }


  getEducation(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/qualifications`,

    );
  }

  getInstitutes(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/institute-names`,

    );
  }
  getAllCities(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/cities`,

    );
  }


  getselectedEducation(data: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/qualifications/${data}`,

    );
  }


  selectedqualification(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/save-last-qualification-details`,
      data
    );
  }
  // *************************Reference *************************

  saveReference(data: any, id: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/references`,
      data
    );
  }
  // *************************Summary *************************

  getSummary(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id}/summary`,

    );
  }

  //coapplicant summary - single summary coapplicant
  getCoappSummary(id1: string, id2: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/${id1}/summary/${id2}`,

    );
  }
  // *************************submit Summary *************************

  //coapplicant summary
  submitCoappSummary(data:any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/applications/applicant/submit`,
data
    );
  }

  // ************************* Save and Exit data *************************

  saveandExit(data: any): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/draft/save`,
      data
    );
  }

  // *************************get saved data *************************


  getSavedData(id1: string, id2: string, sectionkey: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/draft/get?applicationId=${id1}&applicantId=${id2}&sectionKey=${sectionkey}`,

    );
  }

  // *************************get saved data for income and education*************************
  getUploadedData(id1: string, id2: string, sectionkey: string, category: string, subcategory: string, documentType: string): Observable<ApiResponse<any>> {
    console.log(id1, id2, sectionkey, category, subcategory, documentType)
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/los/draft/get?applicationId=${id1}&applicantId=${id2}&sectionKey=${sectionkey}&category=${category}&subcategory=${subcategory}&documentType=${documentType}`,

    );
  }
}
