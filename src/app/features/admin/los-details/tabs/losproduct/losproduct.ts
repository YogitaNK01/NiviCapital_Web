import { Component } from '@angular/core';

@Component({
  selector: 'app-losproduct',
  imports: [],
  templateUrl: './losproduct.html',
  styleUrl: './losproduct.scss'
})
export class Losproduct {

  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }
    downloadImage() {

    // this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }
  
}
