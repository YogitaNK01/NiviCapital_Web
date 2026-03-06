import { CommonModule,isPlatformBrowser   } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef,Inject, Input, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'app-checkbox',
  imports: [CommonModule ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  standalone: true,
   providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true
    }
  ]

})
export class Checkbox  implements AfterViewInit {
  private static nextId = 0;
  checkboxId = `app-checkbox-${Checkbox.nextId++}`;

  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() label: string = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  @ViewChild('checkboxInput') checkboxInput!: ElementRef<HTMLInputElement>;

    onChange = (_: any) => {};
  onTouched = () => {};
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.checkboxInput && this.indeterminate) {
      this.checkboxInput.nativeElement.indeterminate = true;
    }
  }

  writeValue(value: any): void {
    this.checked = !!value;   // 👈 THIS UPDATES UI
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
  toggleCheckbox(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.checkedChange.emit(this.checked);

    if (isPlatformBrowser(this.platformId) && this.checkboxInput) {
      this.checkboxInput.nativeElement.indeterminate = false;
    }
  }
}