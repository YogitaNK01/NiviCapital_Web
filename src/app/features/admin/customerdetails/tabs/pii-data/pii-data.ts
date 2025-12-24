import { Component } from '@angular/core';
import { Main } from '../../../../../core/service/main';

@Component({
  selector: 'app-pii-data',
  imports: [],
  templateUrl: './pii-data.html',
  styleUrl: './pii-data.scss'
})
export class PiiData {
allpiikycdata:any;

constructor(private service:Main){}

ngOnInit(): void {
  
    this.allpiikycdata = this.service.get_pi_KycData();
    console.log("allpikycdata---",this.allpiikycdata)
}
}
