import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Buttons } from '../../features/systemdesign/buttons/buttons';
import { FormsModule } from '@angular/forms';
import { Checkbox } from '../../features/systemdesign/checkbox/checkbox';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';
import { Main } from '../../core/service/main';
import { Msgboxservice } from '../../core/service/msgboxservice';
import { Messagebox } from '../../features/systemdesign/messagebox/messagebox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, Buttons, FormsModule, Checkbox],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isloginChecked = false;

  constructor(public router: Router, private main: Main, private msgBox: Msgboxservice,) { }

  loginData = {
    username: 'yogita@nivicap.com',
    password: 'admin123',
    isloginChecked: true
  };

  onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
  }

  onSubmit(form: any) {
    // if (form.valid) {
    console.log('Form Data:', form.value);

    const inputobj = {
      "username": form.value.username,
      "password":form.value.password,
      

    }
    this.main.getLogin(inputobj).subscribe({
      next: (res) => {
        console.log(res.message)

        this.router.navigate(['admin/dashboard'])

        this.msgBox.open({
        title: '',
        message: res.message, 
        showCancel: false,
        onOk: () => {
         
        }
      });

        // this.main.getAllUsers().subscribe({
        //   next: (response) => {
        //     console.log('Users:', response);
        //   },
        // })
      },
      error: err => console.error(err)
    });


    
    // }
  }
}
