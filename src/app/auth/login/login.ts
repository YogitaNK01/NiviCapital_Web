import { Component } from '@angular/core';
import { Buttons } from '../../features/systemdesign/buttons/buttons';
import { FormsModule, NgForm } from '@angular/forms';
import { Checkbox } from '../../features/systemdesign/checkbox/checkbox';
import { Router } from '@angular/router';
import { Main } from '../../core/service/main';
import { Msgboxservice } from '../../core/service/msgboxservice';
import { CryptoService } from '../../utils/CryptoService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [Buttons, FormsModule, Checkbox],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isloginChecked: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private main: Main, private msgBox: Msgboxservice,private cryptoService:CryptoService) { }

  loginData = {
    username: '',
    password: '',
    isloginChecked: true
  };

  onCheckboxChange(value: boolean): void {
    this.isloginChecked = value;
  }

  // onSubmit(form: NgForm): void {
  //   //  this.router.navigate(['admin/dashboard']);
  //   // Validate form before submission
  //   if (!form.valid) {
  //     this.msgBox.open({
  //       title: 'Validation Error',
  //       message: `Please fill in all required fields`,
  //       showCancel: false,
  //       onOk: () => { }
  //     });
  //     return;
  //   }

  //   // Prevent duplicate submissions
  //   if (this.isLoading) {
  //     return;
  //   }

  //   this.isLoading = true;

  //   const inputobj = {
  //     username: form.value.username,
  //     password: form.value.password
  //   };

  //   this.main.getLogin(inputobj).subscribe({
  //     next: (res) => {
  //       this.isLoading = false;
  //       const lastLogin = res.lastLoginDateTime;
  //       const fullName = res.fullName;
  //       if (fullName) {
  //         this.main.setFullName(fullName);
  //       }
  //       if (lastLogin) {
  //         this.main.setLastLogin(lastLogin);
  //       }

  //       this.router.navigate(['admin/dashboard']);

  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       this.msgBox.open({
  //         title: 'Login Error',
  //         message: err.error?.message || `Invalid credentials. Please try again.`,
  //         showCancel: false,
  //         onOk: () => { }
  //       });
  //     }
  //   });
  // }


async onSubmit(form: NgForm): Promise<void> {
  if (!form.valid) {
    this.msgBox.open({
      title: 'Validation Error',
      message: 'Please fill in all required fields',
      showCancel: false,
      onOk: () => {}
    });
    return;
  }

  if (this.isLoading) {
    return;
  }

  this.isLoading = true;

  try {
    const inputobj = {
      username: await this.cryptoService.encrypt(form.value.username),
      password: await this.cryptoService.encrypt(form.value.password)
    };

    this.main.getLogin(inputobj).subscribe({
      next: async (res) => {
        this.isLoading = false;

        // API response data is inside res.data
        const data = res?.data;

        if (!data) {
          this.msgBox.open({
            title: 'Login Error',
            message: 'Invalid response from server.',
            showCancel: false,
            onOk: () => {}
          });
          return;
        }

        // decrypt response fields
        const fullName = data.fullName
          ? await this.cryptoService.decrypt(data.fullName)
          : '';

        const userName = data.username
          ? await this.cryptoService.decrypt(data.username)
          : '';

        console.log('Username:', userName);
        console.log('Full Name:', fullName);
        console.log('Admin ID:', data.adminId);
        console.log('Role:', data.role);
        console.log('Last Login:', data.lastLoginDateTime);
        console.log('Next Step:', data.nextStep);

        if (fullName) {
          this.main.setFullName(fullName);
        }

        if (data.lastLoginDateTime) {
          this.main.setLastLogin(data.lastLoginDateTime);
        }

        // optional: store username if you have a setter
        // this.main.setUserName(userName);

        this.router.navigate(['admin/dashboard']);
      },

      error: (err) => {
        this.isLoading = false;

        this.msgBox.open({
          title: 'Login Error',
          message: err.error?.message || 'Invalid credentials. Please try again.',
          showCancel: false,
          onOk: () => {}
        });
      }
    });
  } catch (err) {
    this.isLoading = false;

    console.error('Encryption Error', err);

    this.msgBox.open({
      title: 'Error',
      message: 'Unable to secure request.',
      showCancel: false,
      onOk: () => {}
    });
  }
}


  
}
