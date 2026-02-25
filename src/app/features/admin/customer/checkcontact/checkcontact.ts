import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Buttons } from '../../../systemdesign/buttons/buttons';
import { FormsModule, NgForm } from '@angular/forms';
import { Main } from '../../../../core/service/main';
import { Tables } from "../../../systemdesign/tables/tables";
import { TableData } from '../../../../core/service/table-data';
import { Router, RouterModule } from '@angular/router';
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
  // Id: string;
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
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public service: Main, private tableDataService: TableData, private router: Router, private addcustomerservice: Addcustomerservice, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {

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
        this.number_id = res.data.userInitiateId;
        if (
          (
            res.data?.status?.includes("NEW_USER") ||
            res.data?.status?.includes("INITIATED")
          )
        ) {
          console.log("new user found");
          this.norecordfound = true;
          this.cd.detectChanges();
        } else if (res.message.includes("Existing customer found")) {
          this.isexistinguser = true;
          this.loadallusers()
          this.cd.detectChanges();
        }
        this.searchLoading = false;
      },
      error: (err) => {
        console.error("error msg", err);
      }
    })

  }

  addcustomer() {
    this.router.navigate(['/admin/customer/addcustomer'], { queryParams: { phone: this.mobilenumber, id: this.number_id } });

  }
  getStatusClass(status: string) {
    return this.tableDataService.getStatus_Class(status);
  }

  private loadallusers(): void {
    this.service.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let resdate = response.data.content;
          this.AlluserData = resdate;
          this.fullData = this.tableDataService.transformUserData(resdate);
          this.filteredData = this.fullData;
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
