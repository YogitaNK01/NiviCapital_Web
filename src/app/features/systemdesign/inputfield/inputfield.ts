import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inputfield',
  imports: [CommonModule, FormsModule],
  templateUrl: './inputfield.html',
  styleUrls: ['./inputfield.scss']
})
export class Inputfield {
   // ✅ Text inputs
  @Input() label: string = '';
  @Input() helpTextValue: string = '';

  // ✅ Visibility toggles
  @Input() showLabel: boolean = true;
  @Input() showHelpText: boolean = true;

//  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() helpText: string = '';
  @Input() type: 'text' | 'password' | 'email' | 'search' = 'text';
  @Input() state: 'default' | 'error' | 'success' = 'default';
  @Input() showSearch: boolean = false;
  @Input() showInfo: boolean = false;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  value: string = '';
   passwordVisible: boolean = false;
  currentType: string= '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    // Initialize currentType based on the type input
    this.currentType = this.type;
  }

  get showPasswordToggle(): boolean {
    return this.type === 'password';
  }

  get showStateIcon(): boolean {
    return (this.state === 'error' || this.state === 'success') && !this.showPasswordToggle;
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
    // Toggle between 'password' and 'text'
    this.currentType = this.passwordVisible ? 'text' : 'password';
    console.log('Password toggled:', this.currentType, 'Visible:', this.passwordVisible);
  }
 
  onInputChange(value: string): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }


  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
