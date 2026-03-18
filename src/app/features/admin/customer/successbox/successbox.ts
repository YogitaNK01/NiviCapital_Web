import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, JsonPipe, NgFor } from '@angular/common';


@Component({
  selector: 'app-successbox',
  standalone: true,
  imports: [CommonModule, Buttons, NgFor],
  templateUrl: './successbox.html',
  styleUrl: './successbox.scss'
})
export class Successbox implements OnInit {

  constructor(private router: Router,private route: ActivatedRoute,private cdr: ChangeDetectorRef) { }

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevstep = new EventEmitter<void>();

  @Input() title!: string;
  @Input() description!: string;
  @Input() boxText?: string;
  @Input() id!: string;
  @Input() copy?: boolean=false;

  @Input() buttons: {
    label: string;
    action: string;
    outline: boolean;
    color: string;
    class?: string;
  }[] = [];

  @Output() actionClick = new EventEmitter<string>();
@Input() CustomerCIF!: string;
@Input() CustomerName!: string;
@Input() CustomerNCID!: string;

copied = false;

 ngOnInit(): void {
   
    this.route.queryParams.subscribe(params => {
      console.log("all params----",params);
      this.CustomerCIF=params['cifId'];
      this.CustomerName=params['fullName'];
      this.CustomerNCID=params['ncid'];

    });
  }
  
  copyArn() {
  if (!this.id || this.copied) return;

  navigator.clipboard.writeText(this.id).then(() => {
    console.log('ARN copied');
    this.copied = true;
    this.cdr.detectChanges(); 

    setTimeout(() => {this.copied = false, 
    this.cdr.detectChanges()}
    ,2000);
  })
  .catch(()=>{})
  
}
}