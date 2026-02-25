import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Buttons } from '../../../../systemdesign/buttons/buttons';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from '../../../../systemdesign/checkbox/checkbox';
import { Dropdown, DropdownOption } from '../../../../systemdesign/dropdown/dropdown';
import { Inputfield } from '../../../../systemdesign/inputfield/inputfield';
import { Radiobuttons } from '../../../../systemdesign/radiobuttons/radiobuttons';
import { Uploadbtn, UploadConfig, UploadResult } from '../../../../systemdesign/uploadbtn/uploadbtn';
import { Loanstepperservice } from '../../../../../core/service/loanstepperservice';

@Component({
  selector: 'app-edusection',
  imports: [CommonModule, Buttons, Checkbox, Dropdown, ReactiveFormsModule, Uploadbtn, Radiobuttons, Inputfield],
  standalone: true,
  templateUrl: './edusection.html',
  styleUrl: './edusection.scss'
})
export class Edusection {
uploadedFiles= {};
  files: any = {};

  basicConfig: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };

  
  @Input() group!: FormGroup;
  @Input() title!: string;
@Input() isHigher: boolean = false;

@Input() sectionType!: 'school' | 'bachelors' | 'postgrad';

   //dropdowns
  @Input() avatarUrl = '';
  @Input() hasAvatar = false;
  passingyear: string = 'Year of Passing';
  selectpassingyr: DropdownOption[] = [
    { label: 'Loan', value: 'Loan', icon: '' },
  ];


  per_cgpa: string = 'Percentage / CGPA ';
  selectpercentage: DropdownOption[] = [
    { label: 'New Loan', value: 'newLoan', icon: '' },
    { label: 'Balance Transfer', value: 'balancetransfer', icon: '' },
  ]

  location: string = 'Location';
  selectlocation: DropdownOption[] = [
    { label: 'abc', value: 'educationloan', icon: '' },
  ]

  constructor(private fb: FormBuilder, private stepperService: Loanstepperservice, private cd: ChangeDetectorRef) { }

ngOnInit(): void {
  
}

get documentConfig() {
  switch (this.sectionType) {
    case 'school':
      return [
        { label: 'Marksheet', control: 'marksheet' },
        { label: 'School Leaving Certificate', control: 'lc' }
      ];

    case 'bachelors':
      return [
        { label: 'Marksheet of 5 years', control: 'marksheet' },
        
      ];;

    case 'postgrad':
      return [
        { label: 'Marksheet of 3 years', control: 'marksheet' },
      ];

    default:
      return [];
  }
}
 onFileChange(result: UploadResult, controlName: string) {
  if (!result.file) {
    this.group.get(controlName)?.setValue(null);
    return;
  }

  this.group.get(controlName)?.setValue(result.file);
}

  addotherdocuments() {

  }

}
