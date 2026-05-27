import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Button } from 'bootstrap';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Addcustomerservice } from '../../../../../core/service/addcustomerservice';
import { Main } from '../../../../../core/service/main';
import { TableData } from '../../../../../core/service/table-data';

@Component({
  selector: 'app-coappdashboard',
  imports: [CommonModule, Buttons, RouterOutlet],
  standalone: true,
  templateUrl: './coappdashboard.html',
  styleUrl: './coappdashboard.scss'
})
export class Coappdashboard implements OnInit {
  applicantId: any;
  applicationId: any
  custName: any;
  arnid: any;
  isChildRouteActive = false;

  coApplicants: any[] = [];
  maxCoApplicants = 4;
  coApplicantIndex: number = 1;

  constructor(public service: Main, private router: Router, private addcustomerservice: Addcustomerservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {

      // Store in variables if needed
      this.applicantId = params['applicantId'];;
      this.applicationId = params['applicationId'];
      this.custName = params['custName'];
      this.arnid = params['custARN'];

      
    });
    this.loadCoApplicants();
  }
  add() {


    this.loadCoApplicants();

    if (this.coApplicants.length >= this.maxCoApplicants) {
      alert('Maximum 4 co-applicants can be added.');
      return;
    }

    const nextIndex = this.getNextAvailableCoApplicantIndex();

    this.router.navigate(
      ['coapplicantinfo'],
      {
        relativeTo: this.route,
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.arnid,
          coApplicantIndex: nextIndex
        },
        // queryParamsHandling: 'merge' 
      }
    );

  }
  getNextAvailableCoApplicantIndex(): number {
    const usedIndexes = this.coApplicants.map(x => Number(x.index));

    for (let i = 1; i <= this.maxCoApplicants; i++) {
      if (!usedIndexes.includes(i)) {
        return i;
      }
    }

    return this.maxCoApplicants;
  }

  loadCoApplicants() {
    const saved = localStorage.getItem(`coApplicants_${this.applicantId}`);
    this.coApplicants = saved ? JSON.parse(saved) : [];
  }

  //open 
  openCoApplicant(index: number) {
    this.router.navigate(
      ['coapplicantinfo'],
      {
        relativeTo: this.route,
        queryParams: {
          applicantId: this.applicantId,
          applicationId: this.applicationId,
          custName: this.custName,
          custARN: this.arnid,
          coApplicantIndex: index
        }
      }
    );
  }

  //delete 
  deleteCoApplicant(index: number) {
    this.coApplicants = this.coApplicants.filter(x => Number(x.index) !== Number(index));

    localStorage.setItem(
      `coApplicants_${this.applicantId}`,
      JSON.stringify(this.coApplicants)
    );

    localStorage.removeItem(`coapp_mobile_submitted_${this.applicantId}_${index}`);
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

  back() { }

  next() { }

}
