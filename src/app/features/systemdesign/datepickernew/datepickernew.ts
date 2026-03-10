import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../shared/config/date-format';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';


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
    }
  ]
})
export class Datepickernew implements OnInit, ControlValueAccessor {
  selectedDate: Date | null = null;
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @Input() disablePastDates: boolean = false;
  minDate: Date | null = null;

  onChange = (_: any) => { };
  onTouched = () => { };


  ngOnInit() {

  if (this.disablePastDates) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.minDate = tomorrow;
  }

}


  writeValue(value: Date | null): void {
    this.selectedDate = value;
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

  onDateChange(val: Date | null) {
    this.selectedDate = val;
    this.onChange(val);
    this.onTouched();
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


