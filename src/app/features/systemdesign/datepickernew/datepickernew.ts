import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../shared/config/date-format';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormsModule, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-datepickernew',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatMomentDateModule, FormsModule],
  standalone: true,
  templateUrl: './datepickernew.html',
  styleUrl: './datepickernew.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Datepickernew),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => Datepickernew),
      multi: true
    }
  ]
})
export class Datepickernew implements OnInit, ControlValueAccessor, Validator {

 validatorChange = () => {};

registerOnValidatorChange(fn: () => void): void {
  this.validatorChange = fn;
}
  selectedDate: Date | null = null;
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @Input() required: boolean = false;

  @Input() disablePastDates: boolean = false;
  @Input() disablefutureDates: boolean = false;
  @Input() minDate: Date | null = null;
  @Input() minyear: number = 1960;

  @Input() maxDate: Date | null = null;
  rawDateValue: string = '';


  onChange = (_: any) => { };
  onTouched = () => { };


  ngOnInit() {

    const minYearDate = new Date(this.minyear, 0, 1); // 01-01-1960
    minYearDate.setHours(0, 0, 0, 0);



    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);


    if (this.disablePastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.minDate = today > minYearDate ? today : minYearDate;
    } else if (this.disablefutureDates) {
      this.maxDate = yesterday;
    }
    else {
      this.minDate = minYearDate;

    }


  }


writeValue(value: any): void {
  this.selectedDate = value;

  if (value) {
    this.rawDateValue = moment(value).format('DD/MM/YYYY');
  } else {
    this.rawDateValue = '';
  }

  setTimeout(() => {
    this.validatorChange();
  });
}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  allowOnlyDate(event: KeyboardEvent) {
    const allowedKeys = /[0-9\/]/;

    if (!allowedKeys.test(event.key)) {
      event.preventDefault();
    }
  }
 validate(control: AbstractControl): ValidationErrors | null {
  const value = this.rawDateValue;

  if (this.required && (!value || value.trim() === '')) {
    return { required: true };
  }

  if (!value) return null;

  const validFormat = moment(value, 'DD/MM/YYYY', true).isValid();

  if (!validFormat) {
    return { invalidDate: true };
  }

  const enteredDate = moment(value, 'DD/MM/YYYY', true).toDate();
  enteredDate.setHours(0, 0, 0, 0);

  if (this.minDate) {
    const min = new Date(this.minDate);
    min.setHours(0, 0, 0, 0);

    if (enteredDate < min) {
      return { invalidDate: true };
    }
  }

  if (this.maxDate) {
    const max = new Date(this.maxDate);
    max.setHours(0, 0, 0, 0);

    if (enteredDate > max) {
      return { invalidDate: true };
    }
  }

  return null;
}
onManualInput(event: any) {
  let value = event.target.value;

  // allow only numbers and slash
  value = value.replace(/[^0-9/]/g, '');

  // max DD/MM/YYYY length
  if (value.length > 10) {
    value = value.substring(0, 10);
  }

  event.target.value = value;
  this.rawDateValue = value;

  if (!value) {
    this.selectedDate = null;
    this.onChange(null);
    this.validatorChange();
    return;
  }

  const parsed = moment(value, 'DD/MM/YYYY', true);

  if (parsed.isValid()) {
    const date = parsed.toDate();

    this.selectedDate = date;

    // ✅ this is important
    // sends typed date to parent ngModel
    this.onChange(date);
  } else {
    this.selectedDate = null;
    this.onChange(null);
  }

  this.onTouched();
  this.validatorChange();
}

  onDateChange1(val: Date | null) {
    if (!val) {
      this.selectedDate = null;
      this.onChange(null);
      return;
    }
    const stringVal = val.toString();
    if (stringVal.length > 10) { return; }
    this.selectedDate = val;
    this.onChange(val);
    this.onTouched();
  }
onDateChange(val: any) {
  this.selectedDate = val;

  if (val) {
    this.rawDateValue = moment(val).format('DD/MM/YYYY');
    this.onChange(val);
  } else {
    this.onChange(null);
  }

  this.onTouched();
  this.validatorChange();
}
  onPickerOpen() {
    setTimeout(() => {
      const overlay = document.querySelector('.cdk-overlay-pane .mat-datepicker-content');
      if (overlay && this.selectedDate) {
        const formatted = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: '2-digit'
        }).format(this.selectedDate);

        overlay.setAttribute('data-selected', formatted);
      }
    });
  }

}


