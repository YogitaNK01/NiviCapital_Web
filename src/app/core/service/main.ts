import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment'

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
export class Main {

    private baseUrl = environment.apiBaseUrl;
    private kycSubject = new BehaviorSubject<any>(this.getFromSession());
    kyc$ = this.kycSubject.asObservable();

  selectedUserId: any;
  docofselectedUser: any;

  constructor(public http: HttpClient) { }

 
//login
   getLogin(payload: any) : Observable<any>{
    return this.http.post<any>(
      `${this.baseUrl}/admin/auth/login`,
      payload,
      { withCredentials: true }
    );
  }

  //get all users data
  getAllUsers(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/admin/users`,
      { withCredentials: true }
    );
  }

  //get kyc details of single user 
  getKycDeatils(id: any): Observable<any[]> {
    return this.http.get<any[]>(  `${this.baseUrl}/v1/profile/${id}`,
      { withCredentials: true }  );
  }

//set customer details pi,pii,kyc data
 set_pi_KycData(data: any) {
    sessionStorage.setItem('kycs', JSON.stringify(data));
    this.kycSubject.next(data);
  }

  get_pi_KycData() {
    return this.kycSubject.value;
  }

  private getFromSession() {
    const data = sessionStorage.getItem('kycs');
    return data ? JSON.parse(data) : null;
  }

  clear() {
    sessionStorage.removeItem('kycs');
    this.kycSubject.next(null);
  }


//logout

 Logout(): Observable<any> {
    return this.http.post<any>(
      // `${this.baseUrl}/auth/logout`,
      'http://192.168.5.46:8081/nivicapstage/api/auth/logout',
      { withCredentials: true }
    );
  }











  //get all applicants
  getAllApplicants(): Observable<any> {
    return this.http.get<any[]>('nivicap/api/los/applications');
  }

  //get all documents of user (pan,aadhar etc)
  getUserDocuments(id: any): Observable<any> {
    return this.http.get<any[]>('nivicap/api/los/applications/' + id + '/documents');
  }

  //Download documents of user (pan,aadhar etc)
  downloadDocs(userid: any, id: any) {
    const url = 'nivicap/api/los/applications/' + userid + '/documents/' + id + '/download'
    this.http.get<any[]>(url);
    window.open(url, '_blank');
  }


}
