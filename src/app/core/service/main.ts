import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  errors: any;
  data: T;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserData {
  cif: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  kycStatus: string;
  userId: string;
  id: string;
  createdDateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class Main {
  private baseUrl = environment.apiBaseUrl;
  private kycSubject = new BehaviorSubject<any>(this.getFromSession());
  kyc$ = this.kycSubject.asObservable();

  private losSubject = new BehaviorSubject<any>(this.getFromSession());
  los$ = this.losSubject.asObservable();


  selectedUserId: string | null = null;
  docofselectedUser: any = null;

  constructor(private http: HttpClient) { }

  getLogin(payload: LoginPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/admin/auth/login`,
      payload,
      { withCredentials: true }
    );
  }

  getAllUsers(): Observable<ApiResponse<UserData[]>> {
    return this.http.get<ApiResponse<UserData[]>>(
      `${this.baseUrl}/admin/users`,
      { withCredentials: true }
    );
  }

  getKycDetails(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/v1/profile/${id}`,
      { withCredentials: true }
    );
  }

  set_pi_KycData(data: any): void {
    sessionStorage.setItem('kycs', JSON.stringify(data));
    this.kycSubject.next(data);
  }

  get_pi_KycData(): any {
    return this.kycSubject.value;
  }

  private getFromSession(): any {
    try {
      const data = sessionStorage.getItem('kycs');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem('kycs');
    this.kycSubject.next(null);
    sessionStorage.removeItem('los');
    this.losSubject.next(null);
  }

  Logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

   // LOS api  
  getLosDetails(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/v1/los/applications`,
      { withCredentials: true }
    );
  }

 set_los_Data(data: any): void {
    sessionStorage.setItem('los', JSON.stringify(data));
    this.losSubject.next(data);
  }

  get_los_Data(): any {
    return this.losSubject.value;
  }
  getUserDocuments(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/v1/los/applications/${id}/documents`,
      { withCredentials: true }
    );
  }

  downloadDocs(userid: string, id: string): Observable<Blob> {
    return this.http.get<Blob>(
      `${this.baseUrl}/v1/los/applications/${userid}/documents/${id}/download`,
      {
        responseType: 'blob' as 'json',
        withCredentials: true
      }
    );
  }

 
}
