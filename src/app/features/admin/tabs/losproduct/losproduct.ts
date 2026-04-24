import { Component } from '@angular/core';

@Component({
  selector: 'app-losproduct',
  imports: [],
  templateUrl: './losproduct.html',
  styleUrl: './losproduct.scss'
})
export class Losproduct {

  viewImage(imagePath: string): void {
    window.open(imagePath, '_blank');
  }
    downloadImage() {


  }
  
}
