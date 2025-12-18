import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Buttons } from '../buttons/buttons';

@Component({
  selector: 'app-messagebox',
  imports: [CommonModule,Buttons],
  standalone:true,
  templateUrl: './messagebox.html',
  styleUrl: './messagebox.scss'
})
export class Messagebox {


  @Input() title = 'Message';
  @Input() message = '';

  @Input() showCancel = true;
  @Input() okText = 'OK';
  @Input() cancelText = 'Cancel';

  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  // @Output() close = new EventEmitter<void>();

  onOk() {
    this.ok.emit();
    // this.close.emit();
  }

  onCancel() {
    this.cancel.emit();
    // this.close.emit();
  }
}
