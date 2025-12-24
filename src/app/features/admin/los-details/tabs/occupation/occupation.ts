import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Checkbox } from '../../../../systemdesign/checkbox/checkbox';
import { Radiobuttons } from '../../../../systemdesign/radiobuttons/radiobuttons';

@Component({
  selector: 'app-occupation',
  imports: [CommonModule,Checkbox,Radiobuttons],
  templateUrl: './occupation.html',
  styleUrl: './occupation.scss'
})
export class Occupation {
issalaried:boolean=false;
isChecked:boolean=false;
  checkselectedOption_rb = 'option2';

  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }
    downloadImage() {

    // this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }

   // **********************checkbox*****************************

  onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
  }

    //******************radio buttons*************************** */


  isCheckedDefault = false;
  isCheckedChecked = true;

  onCheckboxChange1(value: boolean, label: string) {
    console.log(label, value);
    // Update local state if you want two-way binding
    if (label === 'Default') this.isCheckedDefault = value;
    if (label === 'Checked') this.isCheckedChecked = value;
  }


  checkselectedOption = 'option2';
}
