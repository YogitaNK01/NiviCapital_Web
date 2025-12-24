import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Dropdown, DropdownOption } from '../../../../systemdesign/dropdown/dropdown';
import { Checkbox } from '../../../../systemdesign/checkbox/checkbox';
import { Buttons } from '../../../../systemdesign/buttons/buttons';

@Component({
  selector: 'app-summary',
  imports: [CommonModule,Dropdown,Checkbox,Buttons],
  templateUrl: './summary.html',
  styleUrl: './summary.scss'
})
export class Summary {
  isChecked:boolean = false;
  
 selectedOption2: string = '';
  myOptions2: DropdownOption[] = [
    { label: 'Loan', value: 'pdf', icon: '/assets/images/icons/note.svg' },
    { label: 'Forex', value: 'excel', icon: '/assets/images/icons/note.svg' },
    { label: 'Insurance', value: 'json', icon: '/assets/images/icons/note.svg' },
    { label: 'Others', value: 'others', icon: '/assets/images/icons/note.svg' }
  ];
  onSelectionChange2(value: string) {
    console.log('Selected:2', value);
  }

    onCheckboxChange(value: boolean, label: string) {
    console.log(label, value);
    }
}
