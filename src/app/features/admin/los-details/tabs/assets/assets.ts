import { Component } from '@angular/core';

@Component({
  selector: 'app-assets',
  imports: [],
  templateUrl: './assets.html',
  styleUrl: './assets.scss'
})
export class Assets {


  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }
    downloadImage() {

    // this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }
}
