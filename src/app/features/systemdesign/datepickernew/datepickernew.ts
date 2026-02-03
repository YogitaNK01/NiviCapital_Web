import { Component, Pipe } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../shared/config/date-format';
import { MatMomentDateModule } from '@angular/material-moment-adapter';


@Component({
  selector: 'app-datepickernew',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule,MatMomentDateModule ,FormsModule,DatePipe ],
  standalone: true,
  templateUrl: './datepickernew.html',
  styleUrl: './datepickernew.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
})
export class Datepickernew {
selectedDate = new Date();

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
