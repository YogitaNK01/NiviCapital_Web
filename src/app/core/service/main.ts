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
export interface PageResponse<T> {
  content: T[];
  pageable: any;   // you can type later if needed
}

export interface UserData {
 id: string;
  custId:string;
  ncId:string
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: string;
  kycStatus: string;
  createdAt: number[];
}

@Injectable({
  providedIn: 'root'
})
export class Main {
  // private baseUrl = environment.apiBaseUrl;
  private baseUrl = "/nivicapstage/api";
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
      payload
    );
  }

 
  getAllUsers(): Observable<ApiResponse<PageResponse<UserData>>> {
  return this.http.get<ApiResponse<PageResponse<UserData>>>(
    `${this.baseUrl}/v1/customers/my-customers`
  );
}


  getKycDetails(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/v1/profile/${id}`,
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
         );
  }

   // LOS api  
  getLosDetails(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/v1/los/applications`,
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
       );
  }

  downloadDocs(userid: string, id: string): Observable<Blob> {
    return this.http.get<Blob>(
      `${this.baseUrl}/v1/los/applications/${userid}/documents/${id}/download`,
      {
        responseType: 'blob' as 'json',
        
      }
    );
  }

 
//mask the mobile and email address
  maskValue(value: string): string {
  if (!value) return '';

  // EMAIL
  if (value.includes('@')) {
    const [username, domain] = value.split('@');

    if (username.length <= 2) {
      return username[0] + '*@' + domain;
    }

    const visibleChars = 2;
    const maskedPart = '*'.repeat(username.length - visibleChars);

    return username.slice(0, visibleChars) + maskedPart + '@' + domain;
  }

  // MOBILE NUMBER
  const visibleDigits = 7;
  const cleanNumber = value.replace(/\D/g, ''); // remove spaces/dashes

  if (cleanNumber.length <= visibleDigits) return cleanNumber;

  const maskedLength = cleanNumber.length - visibleDigits;
  return  cleanNumber.slice(-visibleDigits) +'*'.repeat(maskedLength) ;
}

// input validations 
restrictInput(event: Event, type: 'text' | 'number') {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (type === 'text') {
      // Keep only letters and spaces
      value = value.replace(/[^A-Za-z ]+/g, '');

      // Prevent multiple spaces in a row
      value = value.replace(/\s{2,}/g, ' ');

      // Prevent leading space
      value = value.replace(/^\s+/, '');
    }

    if (type === 'number') {
      // Keep only digits
      value = value.replace(/[^0-9]+/g, '');
    }

    // Update only if changed (prevents cursor jumping)
    if (value !== input.value) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  }

  // Indian states and cities api 

   getIndianstates(): Observable<ApiResponse<UserData[]>> {
    return this.http.get<ApiResponse<UserData[]>>(
      `http://192.168.5.42:8085/nivicapstage/api/v1/states`, 
      
    );
  }

  
   getIndianstatescities(id: string): Observable<ApiResponse<UserData[]>> {
    return this.http.get<ApiResponse<UserData[]>>(
      `http://192.168.5.42:8085/nivicapstage/api/v1/${id}/cities`,
    );
  }


  
}


