import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class Loanformservice {
  form!: FormGroup;



  constructor() { }

}


// saveDraft() {
//   const data = this.masterForm.value;
//   this.api.saveDraft(data).subscribe();
// }

// this.api.getDraft().subscribe(data => {
//   this.masterForm.patchValue(data);
// });

// goNext() {
//   const stepGroup = this.masterForm.get('loanInfo');

//   if (stepGroup?.invalid) {
//     stepGroup.markAllAsTouched();
//     return;
//   }

//   this.router.navigate(['../generalinfo']);
// }

// onFile(e) {
//   const file = e.target.files[0];
//   this.form.get('panFile')?.setValue(file);
// }