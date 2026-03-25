import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Addcustomerservice } from '../../../../core/service/addcustomerservice';
import { Loanformservice } from '../../../../core/service/loanformservice';
import { Loanstepperservice } from '../../../../core/service/loanstepperservice';
import { Main } from '../../../../core/service/main';

@Component({
  selector: 'app-summaryinfo',
  imports: [CommonModule,ReactiveFormsModule],
  standalone:true,
  templateUrl: './summaryinfo.html',
  styleUrl: './summaryinfo.scss'
})
export class Summaryinfo {

    openIndex: number[] = [0];
  accordions = [
    { title: 'Reference 1', alwaysOpen: true },
    { title: 'Reference 1', alwaysOpen: false },
  ];
  summaryForm!: FormGroup;

 constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef, private loanformservice: Loanformservice,
    private router: Router, private route: ActivatedRoute, public main: Main, private apiservice: Addcustomerservice) { }
    
  ngOnInit(): void {}

   toggle(index: number) {
    if (this.openIndex.includes(index)) {
      this.openIndex = this.openIndex.filter(i => i !== index);
    } else {
      this.openIndex.push(index);
    }
    this.cd.detectChanges();
  }

  submit() {
  }
  }


