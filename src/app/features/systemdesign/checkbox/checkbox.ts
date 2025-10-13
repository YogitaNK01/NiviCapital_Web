import { CommonModule,isPlatformBrowser   } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID, ViewChild } from '@angular/core';


@Component({
  selector: 'app-checkbox',
  imports: [CommonModule ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  standalone: true

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.checkboxInput && this.indeterminate) {
      this.checkboxInput.nativeElement.indeterminate = true;
    }
  }

  toggleCheckbox(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.checkedChange.emit(this.checked);

    if (isPlatformBrowser(this.platformId) && this.checkboxInput) {
      this.checkboxInput.nativeElement.indeterminate = false;
    }
  }
}