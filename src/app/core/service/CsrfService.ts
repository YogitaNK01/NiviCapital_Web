import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  initialize() {
    return this.http.get<void>(
      `${this.baseUrl}/csrf`,
      {
        withCredentials: true
      }
    );
  }
}