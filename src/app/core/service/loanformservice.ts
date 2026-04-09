import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  errors: any;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class Loanformservice {
  form!: FormGroup;
  // private baseUrl = environment.apiBaseUrl;
  private baseUrl = "/nivicapsit/api";

  kycdetailsID: any;

   isasset:boolean=false;
  isincome:boolean=false;
  issalaried:boolean=false;
  
  generalInfoData: any ;
  estExpenseInfoData: any ;
  additionalInfoData:any ;
  kycInfoData: any ;
  incomeInfoData: any ;
  aseetsInfoData:any ;
  liabilitiesInfoData: any ;
  monthlyExpenditureData: any ;
  referenceInfoData:any ;
  educationInfoData:any;

  constructor(private http: HttpClient) { }
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

  getEducation(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/v1/masters/qualifications`,

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
    )};

    

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
      `${this.baseUrl}/los/applications/lender-names`,
    )};

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

}


// saveDraft() {
//   const data = this.masterForm.value;
//   this.api.saveDraft(data).subscribe();
// }

// this.api.getDraft().subscribe(data => {
//   this.masterForm.patchValue(data);
// });

// goNext() {
//   const stepGroup = this.masterForm.get('loanInfo');

//   if (stepGroup?.invalid) {
//     stepGroup.markAllAsTouched();
//     return;
//   }

//   this.router.navigate(['../generalinfo']);
// }

// onFile(e) {
//   const file = e.target.files[0];
//   this.form.get('panFile')?.setValue(file);
// }