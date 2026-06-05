import { Component, OnInit } from '@angular/core';
import { Loanstepper } from "../loanstepper/loanstepper";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';


@Component({
  selector: 'app-loanlayout',
  standalone: true,
  imports: [Loanstepper, RouterOutlet, ReactiveFormsModule],
  templateUrl: './loanlayout.html',
  styleUrl: './loanlayout.scss'
})
export class Loanlayout implements OnInit {

  masterForm!: FormGroup;

  applicantId: any;
  applicationId: any;

  applicantName: any;
  applicationARN: any;

  constructor(private fb: FormBuilder, private formSvc: Loanformservice, private route: ActivatedRoute, private stepperService: Loanstepperservice,) { }

  ngOnInit() {

    const loandata = sessionStorage.getItem('loanContextData');

    if (loandata) {
      const parsed = JSON.parse(loandata);

      this.applicantId = parsed.applicantId;
      this.applicationId = parsed.applicationId;
      this.applicantName = parsed.custName;
      this.applicationARN = parsed.custARN;
      this.stepperService.setLoanId(this.applicantId, this.applicationId, this.applicantName, this.applicationARN);



      const completedRoute = this.stepperService.getRouteFromStage(
        parsed.currentApplicationStatus
      );

      this.stepperService.markCompletedStepsTillRoute(completedRoute);

      // Load summary only for edit flow
    
 const summaryCall = this.formSvc.loadSummaryIfEdit(this.applicationId,this.applicantId);

    if (summaryCall) {
      summaryCall.subscribe({
        next: (res: any) => {
          this.formSvc.setSummary(res.data);
          console.log('summary cached', res.data);
        },
        error: err => console.error(err)
      });
    }



    }



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
