import { ChangeDetectorRef, Component, effect } from '@angular/core';
import { Main } from '../../../../core/service/main';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { identity, address } from '../../../../shared/config/custdetails.config';
import { Inputfield } from '../../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../../systemdesign/dropdown/dropdown';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { EditMode } from '../../../../core/service/edit-mode';

@Component({
  selector: 'app-pii-data',
  imports: [CommonModule,ReactiveFormsModule,Inputfield,Dropdown],
  templateUrl: './pii-data.html',
  styleUrl: './pii-data.scss'
})
export class PiiData {
allpiikycdata:any;
form: any;
mode: any;
identity=identity;
address=address
  toDropdownOptions(options: string[] = []): DropdownOption[] {
    return options.map(opt => ({
      label: opt,
      value: opt
    }));
  }

  selectedOption: string = '';
  
constructor(private service:Main,private cdr: ChangeDetectorRef, private editModeService: EditMode, private router: Router){
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
        this.allpiikycdata = this.service.get_pi_KycData();
        this.buildForm();
      }

      this.cdr.markForCheck();
    });
}

ngOnInit(): void {
  
    this.allpiikycdata = this.service.get_pi_KycData();
    console.log("allpii-kycdata---",this.allpiikycdata)
     console.log("allpii-kycdata---",this.allpiikycdata.permanentAddress)
}
trackByKey(index: number, field: any) {
    return field.key;
  }

   onSelectionChange(value: any) {
    console.log("dropdown--", value);



  }
    buildForm() {
    const group: { [key: string]: FormControl } = {};

    this.identity.forEach(field => {
      group[field.key] = new FormControl(
        this.allpiikycdata?.[field.key] ?? ''
      );
    });

    this.form = new FormGroup(group);
  }
 initEmptyCustomer() {
    this.allpiikycdata = {
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
