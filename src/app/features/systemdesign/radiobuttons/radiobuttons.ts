import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-radiobuttons',
  imports: [CommonModule],
  templateUrl: './radiobuttons.html',
  styleUrl: './radiobuttons.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Radiobuttons),
      multi: true
    }
  ]

})
export class Radiobuttons implements ControlValueAccessor{
    @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() name: string = '';
 @Input() required: boolean = false;
  @Input() labeldata: string = '';
@Input() value!: string;

  @Output() checkedChange = new EventEmitter<string>();

  selectRadio() {
    if (!this.disabled) {
      this.checkedChange.emit(this.label);
    }
  }

   selectedValue: any;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectOption() {
    this.selectedValue = this.value;
    this.onChange(this.value);
    this.onTouched();
  }
}