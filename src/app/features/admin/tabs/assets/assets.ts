import { Component } from '@angular/core';

@Component({
  selector: 'app-assets',
  imports: [],
  templateUrl: './assets.html',
  styleUrl: './assets.scss'
})
export class Assets {


  viewImage(imagePath: string): void {
    window.open(imagePath, '_blank');
  }
    downloadImage() {


  }
}
