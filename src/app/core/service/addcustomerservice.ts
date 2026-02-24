import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Addcustomerservice {
  
  private baseUrl = "/nivicapstage/api";
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

  generateCIF(data:any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/v1/user/generate-cif`,data,
      
    );
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
