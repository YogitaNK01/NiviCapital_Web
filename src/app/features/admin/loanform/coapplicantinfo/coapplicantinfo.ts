import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Loanstepper } from '../loanstepper/loanstepper';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Main } from '../../../../core/service/main';
import { Coappstepper } from "./coappstepper/coappstepper";

@Component({
  selector: 'app-coapplicantinfo',
  imports: [CommonModule, Loanstepper, Buttons, FormsModule, ReactiveFormsModule, Inputfield,  Coappstepper],
  standalone:true,
  templateUrl: './coapplicantinfo.html',
  styleUrl: './coapplicantinfo.scss'
})
export class Coapplicantinfo {
  applicantId: any;
  applicationId: any;
  
  searchLoading = false;
  norecord: boolean = false;
  norecordfound: boolean = false;
  isexistinguser: boolean = false

  filteredData: any[] = [];
  mobilenumber: any;
  number_id: any
  prefillPhone: any;

  mobileSubmitted: boolean = false;
  
 constructor(public service: Main,  private router: Router, private addcustomerservice: Addcustomerservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef) { }

     ngonInit(){
      this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;

    });
    }

  searchnumber(data: NgForm) {
    if (this.searchLoading) return;

    this.searchLoading = true;
    this.norecordfound = false;

    this.mobilenumber = data.value.phone;
    let input = {
      identifier: this.mobilenumber,
      type: "MOBILE"

    }
    this.addcustomerservice.customersearch(input).subscribe({
      next: (res) => {
        console.log(res);
       
      },
      error: (err) => {
        console.error("error msg", err);
      }
    })

  }

   getPhoneFieldState(phone: any): 'default' | 'error' | 'success' {
  if (phone.touched && phone.invalid) {
    return 'error';
  }
  if (this.norecordfound && phone.valid) {
    return 'error';
  }

  return 'default';
}
  back(){}
  next(){}

}
