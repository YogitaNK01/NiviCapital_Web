import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss'
})



export class Dropdown {
  isOpen: boolean = false;
  searchTerm: string = '';

  @Input() avatarUrl?: string;
  @Input() hasAvatar : boolean = false;

  @Input() label: string = '';
  @Input() placeholder: string = 'Select';
  @Input() options: DropdownOption[] = [];
  @Input() type: 'single' | 'multi' = 'single';
  @Input() searchable: boolean = false;
  @Input() showIcons: boolean = false;
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<any>();


  // Two-way binding
  @Input() selectedValue: string = '';
  @Output() selectedValueChange = new EventEmitter<string>();



  toggleDropdown() {
    console.log("data---------------")
    this.isOpen = !this.isOpen;
    
  }



  selectOption(option: DropdownOption) {
    this.selectedValue = option.value;
    this.selectionChange.emit(this.selectedValue);
    this.isOpen = false;
  }

  get selectedLabel(): string {
    if (!this.options || this.options.length === 0) return this.placeholder;
    const selected = this.options.find(o => o.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }


  get filteredOptions(): DropdownOption[] {
    if (!this.searchable || !this.searchTerm) return this.options;
    const lower = this.searchTerm.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(lower));
  }
}
