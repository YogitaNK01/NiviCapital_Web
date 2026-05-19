import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Authservice {
  
  private baseUrl = "/nivicapsit/api";
constructor(private http: HttpClient) {}

 checkLogin() {
  return this.http.get(`${this.baseUrl}/v1/customers/my-customers?page=0&size=10`, {
    withCredentials: true
  });
}


}
