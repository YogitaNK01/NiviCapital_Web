import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Button } from 'bootstrap';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Addcustomerservice } from '../../../../../core/service/addcustomerservice';
import { Main } from '../../../../../core/service/main';
import { TableData } from '../../../../../core/service/table-data';

@Component({
  selector: 'app-coappdashboard',
  imports: [CommonModule,Buttons,RouterOutlet],
  standalone:true,
  templateUrl: './coappdashboard.html',
  styleUrl: './coappdashboard.scss'
})
export class Coappdashboard {
applicantId: any;
applicationId: any
  custName: any;
  arnid: any;
   isChildRouteActive = false;
   constructor(public service: Main, private router: Router, private addcustomerservice: Addcustomerservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef) { }

    ngonInit(){
      this.route.queryParams.subscribe(params => {

      const applicantId = params['applicantId'];
      const applicationId = params['applicationId'];

      // Store in variables if needed
      this.applicantId = applicantId;
      this.applicationId = applicationId;
      this.custName = params['custName'];
      this.arnid = params['custARN'];

    });
    }
  add(){
 
  this.router.navigate(
    ['coapplicantinfo'],
    {
      queryParams: {
        applicantId: this.applicantId,
        applicationId: this.applicationId,
        custName: this.custName,
              custARN: this.arnid
      },
      relativeTo: this.route,queryParamsHandling: 'preserve' 
    }
  );

  }
   onChildActivate() {
    this.isChildRouteActive = true;
  }
  get isChildActive(): boolean {
    return !!this.route.firstChild; // child route exists => educationinfo is active
  }

  onChildDeactivate() {
    this.isChildRouteActive = false;
  }

back(){}

  next(){}

}
