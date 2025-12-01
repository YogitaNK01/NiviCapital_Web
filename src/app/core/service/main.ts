import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class Main {
  selectedUserId:any;
  docofselectedUser:any;

  constructor(public http:HttpClient){}

   getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('/nivicap/api/verification/users');
  }

//get kyc details of single user 
   getKycDeatils(id:any): Observable<any[]> {
    return this.http.get<any[]>('/nivicap/api/kyc/user/'+id+'?onlyActive=true');
  }

  //get all applicants
  getAllApplicants(): Observable<any> {
    return this.http.get<any[]>('nivicap/api/los/applications');
  }

//get all documents of user (pan,aadhar etc)
  getUserDocuments(id:any): Observable<any> {
    return this.http.get<any[]>('nivicap/api/los/applications/'+id+'/documents');
  }

  //Download documents of user (pan,aadhar etc)
  downloadDocs(userid:any,id:any) {
    const url ='nivicap/api/los/applications/'+userid+'/documents/'+id+'/download'
     this.http.get<any[]>(url);
     window.open(url, '_blank');
  }
}
