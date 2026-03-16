import { Component, OnInit } from '@angular/core';
import { Loanstepper } from "../loanstepper/loanstepper";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';


@Component({
  selector: 'app-loanlayout',
  standalone:true,
  imports: [Loanstepper, RouterOutlet,ReactiveFormsModule],
  templateUrl: './loanlayout.html',
  styleUrl: './loanlayout.scss'
})
export class Loanlayout implements OnInit {

   masterForm!: FormGroup;
 
  applicantId: any;
  applicationId: any;
 
  applicantName: any;
  applicationARN: any;
   
  constructor(private fb: FormBuilder, private formSvc: Loanformservice,private route: ActivatedRoute) {}

  ngOnInit() {

     this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];
      const applicantName = params['custName'];
      const applicationARN = params['custARN'];


      this.applicantId = applicantId;
      this.applicationId = applicationId;
       this.applicantName = applicantName.split('%20')[0];
      this.applicationARN = applicationARN;

    });


    this.masterForm = this.fb.group({

      loanInfo: this.fb.group({
        amount: [''],
        tenure: ['']
      }),

      generalInfo: this.fb.group({
        name: [''],
        dob: ['']
      }),

      kyc: this.fb.group({
        pan: [''],
        aadhaar: ['']
      }),

      income: this.fb.group({
        salary: ['']
      }),

      assets: this.fb.group({
        property: ['']
      }),

      liabilities: this.fb.group({
        loans: ['']
      }),

      references: this.fb.group({
        ref1: ['']
      }),

      documents: this.fb.group({
        panFile: [null]
      })

    });
    
 this.formSvc.form = this.masterForm;
   
  }
  
  submit() {
  if (this.masterForm.invalid) return;

  const payload = this.masterForm.value;
  // this.api.submit(payload).subscribe();
}

 
}
