import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Buttons } from "../../../systemdesign/buttons/buttons";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JsonPipe, NgFor } from '@angular/common';


@Component({
  selector: 'app-successbox',
  standalone: true,
  imports: [Buttons, JsonPipe, NgFor],
  templateUrl: './successbox.html',
  styleUrl: './successbox.scss'
})
export class Successbox implements OnInit {

  constructor(private router: Router,private route: ActivatedRoute) { }

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevstep = new EventEmitter<void>();

  @Input() title!: string;
  @Input() description!: string;
  @Input() boxText?: string;
  @Input() id!: string;

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


 ngOnInit(): void {
   
    this.route.queryParams.subscribe(params => {
      console.log("all params----",params);
      this.CustomerCIF=params['cifId'];
      this.CustomerName=params['fullName'];
      this.CustomerNCID=params['ncid'];

    });
  }
  
}