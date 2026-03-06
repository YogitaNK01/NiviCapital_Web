import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { Main } from '../../../../core/service/main';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { piFields, otherFields } from '../../../../shared/config/custdetails.config';
import { EditMode, FormMode } from '../../../../core/service/edit-mode';
import { Inputfield } from "../../../systemdesign/inputfield/inputfield";
import { Dropdown, DropdownOption } from "../../../systemdesign/dropdown/dropdown";
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-pi-data',
  imports: [ReactiveFormsModule, CommonModule, Inputfield, Dropdown],
  standalone: true,
  templateUrl: './pi-data.html',
  styleUrl: './pi-data.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiData implements OnInit {

  form!: FormGroup;
  allpikycdata: any;
  // mode: 'view' | 'edit' | 'add' = 'view';
  // isEditable = false;
  mode: FormMode = 'view';
  piFields = piFields;
  otherFields = otherFields;


  myOptions: DropdownOption[] = [
    { label: 'Type 1', value: 'Type 1' },
    { label: 'Type 2', value: 'Type 2' },
    { label: 'Type 3', value: 'Type 3' },
  ];
  toDropdownOptions(options: string[] = []): DropdownOption[] {
    return options.map(opt => ({
      label: opt,
      value: opt
    }));
  }

  selectedOption: string = '';

  constructor(private service: Main, private cdr: ChangeDetectorRef, private editModeService: EditMode, private router: Router) {
     this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {

      const url = event.urlAfterRedirects;

      if (url.includes('admin/customerdetails')) {
        this.editModeService.setMode('view');
      }

      if (url.includes('admin/addcustomer')) {
        this.editModeService.setMode('add');
      }
    });

    effect(() => {
      this.mode = this.editModeService.mode();
      console.log("mode----",this.mode);
      
      if (this.mode === 'add') {
        this.initEmptyCustomer();
      }

      if (this.mode === 'view' || this.mode === 'edit') {
        this.allpikycdata = this.service.get_pi_KycData();
        this.buildForm();
      }

      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
   
    // this.allpikycdata = this.service.get_pi_KycData();
    // console.log("allpikycdata---", this.allpikycdata);
    // this.buildForm();


  }

  get isEditable() {
    return this.mode === 'edit' || this.mode === 'add';
  }
  onSelectionChange(value: any) {
    console.log("dropdown--", value);



  }
  get formattedDob(): string {
    return Array.isArray(this.allpikycdata?.dob)
      ? this.allpikycdata.dob.join('-')
      : '-';
  }
  trackByKey(index: number, field: any) {
    return field.key;
  }

  buildForm() {
    const group: { [key: string]: FormControl } = {};

    this.piFields.forEach(field => {
      group[field.key] = new FormControl(
        this.allpikycdata?.[field.key] ?? ''
      );
    });

    this.form = new FormGroup(group);
  }


  initEmptyCustomer() {
    this.allpikycdata = {
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '',
      maritalStatus: '',
      gender: '',
      nationality: '',
      email: '',
      phoneNumber: ''
    };
    this.buildForm();
  }

  getFormValue() {
    return this.form.getRawValue();
  }
}
