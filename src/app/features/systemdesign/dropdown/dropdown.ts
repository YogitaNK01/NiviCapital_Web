import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';


export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  checked?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true
    }
  ]
})



export class Dropdown {
  isOpen: boolean = false;
  searchTerm: string = '';

  @Input() avatarUrl?: string;
  @Input() hasAvatar: boolean = false;

  @Input() showSubtext: boolean = false;
  @Input() subtext: string = '';

  @Input() label: string = '';
  @Input() placeholder: string = 'Select';
  @Input() options: DropdownOption[] = [];
  @Input() type: 'single' | 'multi' = 'single';
  @Input() searchable: boolean = false;
  @Input() showIcons: boolean = false;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;

  @Output() selectionChange = new EventEmitter<any>();

  @Input() multiSelect = false;
  selectedValues: any[] = [];

  // Two-way binding
  // @Input() selectedValue: string = '';
  // @Output() selectedValueChange = new EventEmitter<string>();
  @Input() selectedValue!: string | string[];
  @Output() selectedValueChange = new EventEmitter<string | string[]>();

  @Input() customStyle: boolean = false;

  value: any = null;
  selectedLabeldata = '';

 private onChange = (value: any) => {};
  private onTouched = () => { };

  toggleDropdown() {
    // console.log("data---------------")
    this.isOpen = !this.isOpen;

  }

  // selectOption(option: DropdownOption) {
  //   this.selectedValue = option.value;
  //   this.selectedValueChange.emit(option.value);
  //   this.isOpen = false;
  // }

  get selectedLabel(): string {
    if (this.showSubtext && this.subtext) {
      return this.placeholder;
    }

    // if (!this.options || this.options.length === 0) return this.placeholder;
    const selected = this.options.find(o => o.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }


  get filteredOptions(): DropdownOption[] {
    if (!this.searchable || !this.searchTerm) return this.options;
    const lower = this.searchTerm.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(lower));
  }


writeValue(value: string | string[]): void {
  if (Array.isArray(value)) {
    this.selectedValues = value;
  } else {
    this.value = value;
    this.selectedLabeldata = this.getLabelFromValue(value);
  }
}

  getLabelFromValue(value: any): string {
    const match = this.options?.find(opt => opt.value === value);
    return match ? match.label : this.placeholder || '';
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

  // Called by UI
  selectOption(val: string) {
    this.value = val;
    this.onChange(val);
    this.onTouched();

    const selected = this.options.find(o => o.value === val);
    this.selectedLabeldata = selected?.label || this.placeholder;

    this.selectedValueChange.emit(val);

    this.selectedLabeldata = this.getLabelFromValue(val);
    this.isOpen = false;
  }


  toggleSelection(option: any, event: any) {
    event.stopPropagation();

    const index = this.selectedValues.indexOf(option.value);

    // if (index > -1) {
    //   this.selectedValues.splice(index, 1);
    // } else {
    //   this.selectedValues.push(option.value);
    // }

     if (index > -1) {
    this.selectedValues = this.selectedValues.filter(v => v !== option.value);
  } else {
    this.selectedValues = [...this.selectedValues, option.value];
  }
    // console.log('Selected Values:', this.selectedValues);
    this.onChange(this.selectedValues);
    this.selectedValueChange.emit(this.selectedValues);
   

  }

  toggleSelectAll(event: any) {
    event.stopPropagation();

    if (event.target.checked) {
      this.selectedValues = [...this.options.map(o => o.value)];
    } else {
      this.selectedValues = [];
    }
    this.onChange(this.selectedValues);
    this.selectedValueChange.emit(this.selectedValues);
  }

  clearAll(event: any) {
    event.stopPropagation();
    this.selectedValues = [];
    this.onChange(this.selectedValues);
    this.selectedValueChange.emit(this.selectedValues);
  }

  isAllSelected() {
    this.onChange(this.selectedValues);
    return this.options.length &&
         this.selectedValues.length === this.options.length;
  }
}
