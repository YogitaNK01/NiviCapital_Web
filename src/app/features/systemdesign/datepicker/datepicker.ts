import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


interface DateSelection {
  date: Date;
  formatted: string;
}
@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.scss',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Datepicker),
      multi: true
    }
  ]
})
export class Datepicker implements OnInit, ControlValueAccessor {
  @Input() label: string = 'Select date';
  @Input() modalTitle: string = 'Date Picker';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Output() dateSelected = new EventEmitter<DateSelection>();
  currentYear: number = new Date().getFullYear(); 
  
  isModalOpen = false;
  selectedDate: Date = new Date();
  displayDate: string = '';
  currentMonth: Date = new Date();
  currentView: 'days' | 'months' | 'years' = 'days';
  
  years: number[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  weekDays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  calendarDays: (number | null)[] = [];

  // ControlValueAccessor properties
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;
new: any;

  ngOnInit() {
    this.updateDisplayDate();
    this.generateCalendar();
    this.generateYears();
  }

  // ControlValueAccessor methods
  writeValue(value: Date | null): void {
    if (value) {
      this.selectedDate = new Date(value);
      this.currentMonth = new Date(value);
      this.updateDisplayDate();
      this.generateCalendar();
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openModal() {
    if (!this.disabled) {
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.currentView = 'days';
    this.onTouched();
  }

  updateDisplayDate() {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    };
    this.displayDate = this.selectedDate.toLocaleDateString('en-US', options);
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    this.calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(day);
    }
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 50;
    
    this.years = [];
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

  selectDate(day: number | null) {
    if (day === null) return;
    
    const newDate = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day
    );
    
    if (this.isDateDisabled(newDate)) return;
    
    this.selectedDate = newDate;
    this.updateDisplayDate();
    
    const selection: DateSelection = {
      date: this.selectedDate,
      formatted: this.displayDate
    };
    
    this.dateSelected.emit(selection);
    this.onChange(this.selectedDate);
    this.closeModal();
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  showMonthSelector() {
    this.currentView = 'months';
  }

  showYearSelector() {
    this.currentView = 'years';
  }

  selectMonth(monthIndex: number) {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      monthIndex,
      1
    );
    this.generateCalendar();
    this.currentView = 'days';
  }

  selectYear(year: number) {
    this.currentMonth = new Date(
      year,
      this.currentMonth.getMonth(),
      1
    );
    this.generateCalendar();
    this.currentView = 'months';
  }

  isSelectedDate(day: number | null): boolean {
    if (day === null) return false;
    
    return (
      day === this.selectedDate.getDate() &&
      this.currentMonth.getMonth() === this.selectedDate.getMonth() &&
      this.currentMonth.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  isToday(day: number | null): boolean {
    if (day === null) return false;
    
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentMonth.getMonth() === today.getMonth() &&
      this.currentMonth.getFullYear() === today.getFullYear()
    );
  }

  isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  getCurrentMonthYear(): string {
    return this.currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  cancel() {
    this.closeModal();
  }

  ok() {
    const selection: DateSelection = {
      date: this.selectedDate,
      formatted: this.displayDate
    };
    this.dateSelected.emit(selection);
    this.onChange(this.selectedDate);
    this.closeModal();
  }
}
