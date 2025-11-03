import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Buttons } from '../../features/systemdesign/buttons/buttons';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '../../features/systemdesign/checkbox/checkbox';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [CommonModule,Buttons,FormsModule,Checkbox],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isloginChecked = false;

  constructor(public router:Router){ }

  loginData = {
    username: 'admin',
    password: 'admin',
    isloginChecked: true
  };

   onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
   }

  onSubmit(form: any) {
    // if (form.valid) {
      console.log('Form Data:', form.value);
      
      this.router.navigate(['admin/dashboard'])
    // }
  }
}
