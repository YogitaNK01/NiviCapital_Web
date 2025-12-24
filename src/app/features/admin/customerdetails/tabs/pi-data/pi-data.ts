import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../../core/service/main';

@Component({
  selector: 'app-pi-data',
  imports: [],
  templateUrl: './pi-data.html',
  styleUrl: './pi-data.scss'
})
export class PiData implements OnInit{
allpikycdata:any;

constructor(private service:Main){}

ngOnInit(): void {
  
    this.allpikycdata = this.service.get_pi_KycData();
    console.log("allpikycdata---",this.allpikycdata)
}
}
