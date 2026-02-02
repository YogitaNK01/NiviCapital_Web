import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { Main } from '../../../../core/service/main';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { piFields } from '../../../../shared/config/custdetails.config';
import { EditMode } from '../../../../core/service/edit-mode';
import { Inputfield } from "../../../systemdesign/inputfield/inputfield";
import { Dropdown, DropdownOption } from "../../../systemdesign/dropdown/dropdown";


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
  mode: 'view' | 'edit' | 'add' = 'view';
  isEditable = false;
  piFields = piFields;

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

  constructor(private service: Main, private cdr: ChangeDetectorRef, private editModeService: EditMode) {
    effect(() => {
      this.isEditable = this.editModeService.editMode();
      console.log(this.isEditable);
      this.cdr.markForCheck();

    });
  }

  ngOnInit(): void {

    this.allpikycdata = this.service.get_pi_KycData();
    console.log("allpikycdata---", this.allpikycdata);
    this.buildForm();


  }

  onSelectionChange(value: string) {
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
