import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnChanges, Output,SimpleChanges  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';


export interface DropdownOption {
  value: string;
  label: string;
  code?: string;
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



export class Dropdown implements OnChanges, ControlValueAccessor {
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

  @Input() enableSearchEvent: boolean = false;
@Output() searchChange = new EventEmitter<string>();

  @Input() multiSelect = false;
  selectedValues: any[] = [];

  // Two-way binding
  // @Input() selectedValue: string = '';
  // @Output() selectedValueChange = new EventEmitter<string>();
  @Input() selectedValue!: string | string[];
  @Output() selectedValueChange = new EventEmitter<string | string[]>();

  @Input() customStyle: boolean = false;
private isCvaWrite = false;
  value: any = null;
  selectedLabeldata = '';

 private onChange = (value: any) => {};
  private onTouched = () => { };

  constructor(private eRef: ElementRef) {}

  ngOnChanges1(changes: SimpleChanges) {
     if (this.isCvaWrite) return;
  if (changes['selectedValue']) {
    const value = changes['selectedValue'].currentValue;

    if (Array.isArray(value)) {
      this.selectedValues = [...value];
    } else if (value) {
      this.value = value;
      this.selectedLabeldata = this.getLabelFromValue(value);
    } else {
      this.selectedValues = [];
    }
  }
}
ngOnChanges(changes: SimpleChanges) {
  if (this.isCvaWrite) return;

  if (changes['selectedValue'] && changes['selectedValue'].currentValue !== undefined) {
    const value = changes['selectedValue'].currentValue;

    if (value !== this.value) {
      this.value = value;

      if (Array.isArray(value)) {
        this.selectedValues = [...value];
      } else {
        this.selectedLabeldata = this.getLabelFromValue(value);
      }
    }
  }

  if (changes['options'] && this.value) {
    // this.selectedLabeldata = this.getLabelFromValue(this.value);
    
 const match = this.options.find(opt =>
    opt.value === this.value || opt.label === this.value
  );

  if (match) {
    this.selectedLabeldata = match.label;
    this.value = match.value; // normalize
  }

  }
}
  toggleDropdown() {
    // console.log("data---------------")
    this.isOpen = !this.isOpen;

  }

   @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  

  get selectedLabel(): string {
    if (this.showSubtext && this.subtext) {
      return this.placeholder;
    }

    // if (!this.options || this.options.length === 0) return this.placeholder;
    const selected = this.options.find(o => o.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }


  get filteredOptions1(): DropdownOption[] {
  
     return this.options;
  }

  get filteredOptions(): DropdownOption[] {

  //  No filtering for normal dropdowns
  if (this.enableSearchEvent) {
    return this.options;
  }

  if (!this.searchable || !this.searchTerm) return this.options;
    const lower = this.searchTerm.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(lower));
}



writeValue1(value: string | string[]): void {
  if (Array.isArray(value)) {
    this.selectedValues = [...value];
  } else {
    this.value = value;
    this.selectedLabeldata = this.getLabelFromValue(value);
  }
}
writeValue2(value: string | string[]): void {
  this.isCvaWrite = true;   

  this.value = value;

  if (Array.isArray(value)) {
    this.selectedValues = [...value];
  } else if (value) {
    this.selectedLabeldata = this.getLabelFromValue(value);
  } else {
    this.selectedLabeldata = this.placeholder;
  }

  // allow next change detection cycle
  setTimeout(() => (this.isCvaWrite = false));
}
writeValue(value: any): void {
  this.isCvaWrite = true;

  if (!value) {
    this.value = null;
    this.selectedLabeldata = this.placeholder;
    setTimeout(() => (this.isCvaWrite = false));
    return;
  }

  //    MULTI SELECT
  if (Array.isArray(value)) {
    this.selectedValues = [...value];
  } else {
    this.value = value;

    //    try to match option using value OR label
    const match = this.options?.find(opt =>
      opt.value === value || opt.label === value
    );

    if (match) {
      this.selectedLabeldata = match.label;
      this.value = match.value; // normalize
    } else {
      //    fallback if options not loaded yet
      this.selectedLabeldata = value;
    }
  }

  setTimeout(() => (this.isCvaWrite = false));
}


  getLabelFromValue1(value: any): string {
    const match = this.options?.find(opt => opt.value === value);
    return match ? match.label : this.placeholder || '';
  }
  getLabelFromValue(value: any): string {
  if (!this.options?.length || !value) return this.placeholder;

  const match = this.options.find(opt =>
    opt.value === value || opt.label === value
  );

  return match ? match.label : value; //    fallback to raw value
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

onSearchInput(value: string) {
  this.searchChange.emit(value);
}

}
