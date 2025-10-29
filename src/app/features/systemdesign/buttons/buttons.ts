import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buttons',
  imports: [CommonModule],
  templateUrl: './buttons.html',
  styleUrl: './buttons.scss'
})
export class Buttons {
   @Input() label: string = 'Button';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() outline: boolean = false;
  @Input() btncustomClass: string = ''; // extra css classes from parent
  @Input() color: string = ''; // optional inline color override
  @Input() border: string = ''; // optional inline border override
  @Input() height: string = '';           // Height (ex: "40px" / "3rem")
  @Input() width: string = '';     
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() borderradius: boolean = false;
  @Input() bgcolor: 'primary' | 'secondary' | 'blue' = 'primary';


}
