import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  
  // private baseUrl = "/nivicapsit/api";
   private baseUrl = environment.apiBaseUrl;
constructor(private http: HttpClient) {}

 checkLogin() {
  return this.http.get(`${this.baseUrl}/v1/customers/my-customers?page=0&size=10`, {
    withCredentials: true
  });
}


}
