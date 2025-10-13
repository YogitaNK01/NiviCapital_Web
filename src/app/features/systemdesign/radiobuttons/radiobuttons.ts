import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-radiobuttons',
  imports: [CommonModule],
  templateUrl: './radiobuttons.html',
  styleUrl: './radiobuttons.scss',
  standalone: true,

})
export class Radiobuttons {
    @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() name: string = '';

  @Output() checkedChange = new EventEmitter<string>();

  selectRadio() {
    if (!this.disabled) {
      this.checkedChange.emit(this.label);
    }
  }

}