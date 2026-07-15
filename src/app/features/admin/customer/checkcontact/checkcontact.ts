import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormsModule, NgForm } from '@angular/forms';
import { Main } from '../../../../core/service/main';
import { Tables } from "../../../systemdesign/tables/tables";
import { TableData } from '../../../../core/service/table-data';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface TransformedUserData {
  // id: string;
  custId: string;
  ncId: string
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  status: string;
  kycStatus: string;
  createdAt: number[];
  userId: string;
}


@Component({
  selector: 'app-checkcontact',
  imports: [CommonModule, Inputfield, Buttons, FormsModule, Tables, RouterModule],
  standalone: true,
  templateUrl: './checkcontact.html',
  styleUrl: './checkcontact.scss'
})
export class Checkcontact implements OnInit {

  private destroy$ = new Subject<void>();

  searchLoading = false;
  norecord: boolean = false;
  norecordfound: boolean = false;
  isexistinguser: boolean = false

  filteredData: any[] = [];
  mobilenumber: any;
  number_id: any
  prefillPhone: any;

  fullData: TransformedUserData[] = [];
  AlluserData: any[] = [];
  columns = [
    {
      key: 'custId',
      label: 'CUSTID',
      class: 'cifstyle',
      clickable: true,
      // onClick: (row: { Id: any; }) => this.getpidata(row.Id),
      routerLink: '/admin/customerdetails',
      queryParams: "{ mode: 'view', id: row.id }"
    },
    { key: 'ncId', label: 'NCID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      class: 'status',
      classFn: (row: any) => this.getStatusClass(row.status).class,
      transform: (row: any) => this.getStatusClass(row.status).text
    },

    {
      key: 'kycStatus',
      label: 'KYC Status',
      class: 'status',
      classFn: (row: any) => this.getStatusClass(row.kycStatus).class,
      transform: (row: any) => this.getStatusClass(row.kycStatus).text
    },


  ];
  isLoading: boolean = false;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public service: Main, private tableDataService: TableData, private router: Router, private addcustomerservice: Addcustomerservice,
    private route: ActivatedRoute, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    // this.route.queryParams.subscribe(params => {
    //   if (params['phone']) {
    //     this.prefillPhone = params['phone'];

    //   }
    // });

     const flowState = this.service.getState();
   

  if (!flowState) {
    return;
  }

  // this.prefillPhone = flowState.phone;

  }

  searchnumber(data: NgForm) {
    if (this.searchLoading) return;

    this.searchLoading = true;
    this.norecordfound = false;

    this.mobilenumber = data.value.phone;
    let input = {
      identifier: this.mobilenumber,
      type: "MOBILE",
        "applicantType": "PRIMARY", //// PRIMARY / CO_APPLICANT
      "coApplicantIndex": 0,

    }
    this.addcustomerservice.customersearch(input).subscribe({
      next: (res) => {
        console.log(res);
        let respdata= res.data[0];
        this.number_id = respdata.userInitiateId;
        if (
          (
            respdata?.status?.includes("NEW_USER") ||
            respdata?.status?.includes("INITIATED")
          )
        ) {
          console.log("new user found");
          this.norecordfound = true;
          this.cd.detectChanges();
        } else if (res.message.includes("Existing customer found")) {
          this.isexistinguser = true;
          // this.loadallusers()
          const row: TransformedUserData = {
            custId: respdata.custId ?? '-',
            ncId: respdata.ncId ?? '-',
            firstName: respdata.firstName ?? '-',
            lastName: respdata.lastName ?? '-',
            mobile: respdata.mobile ?? '-',
            email: respdata.email ?? '-',
            status: respdata.status ?? '-',
            kycStatus: respdata.kycStatus ?? '-',

            createdAt: respdata.custId ?? '-',
            userId: respdata.userInitiateId ?? '-'

          };
          this.filteredData = [row];
          this.cd.detectChanges();
        }
        this.searchLoading = false;
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
  addcustomer1() {
    this.router.navigate(['/admin/customer/addcustomer'], { queryParams: { phone: this.mobilenumber, id: this.number_id } });

  }
  addcustomer(): void {
  this.service.setState({
    phone: this.mobilenumber,
    userId: this.number_id,
    currentStep: 0
  });

  this.router.navigate(['/admin/customer/addcustomer']);
}

  getStatusClass(status: string) {
    return this.tableDataService.getStatus_Class(status);
  }

  private loadallusers(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const page = 0;
    this.service.checkAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          let resdate = response.data.content;
          this.AlluserData = resdate;
          this.fullData = this.tableDataService.transformUserData(resdate);

          this.filteredData = this.fullData.filter(item => {
            const apiMobile = item?.mobile?.toString().trim();
            const inputMobile = this.mobilenumber?.toString().trim();

            console.log('COMPARE:', apiMobile, inputMobile);

            return apiMobile === inputMobile;
          });

          console.log(this.filteredData);

          // this.filteredData = data;
          this.dataSource.sort = this.sort;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching users:', error);
        }
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
