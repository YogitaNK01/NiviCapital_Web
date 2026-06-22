import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Addcustomerservice {
    // private baseUrl = environment.apiBaseUrl;

  private baseUrl = "/nivicapsit/api";
  constructor(private http: HttpClient) { }

    checkcontact(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/mobile/search`,data,
      
    );
  }

  SendOTP(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/mobile-otp/send`,data,
      
    );
  }
   
verifyOTP(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/mobile-otp/verify`,data,
      
    );
  }

  ResendOTP(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/mobile-otp/resend`,data,
      
    );
  }

  generateCIF(payload:any,edit?:boolean): Observable<any> {


    // return this.http.post<any>(
    //   `${this.baseUrl}/v1/user/generate-cif`,data,
      
    // );

    const url = `${this.baseUrl}/v1/user/generate-cif`;
 return edit
    ? this.http.put<any>(url, payload)
    : this.http.post<any>(url, payload);
  }

  uploadkycdocuments(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/kyc`,data,
      
    );
  }


    customersearch(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/customers/search`,data,
      
    );
  }
   selectproduct(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/los/applications/initiate`,data,
      
    );
  }
}
