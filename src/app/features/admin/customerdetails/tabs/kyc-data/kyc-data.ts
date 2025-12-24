import { Component } from '@angular/core';

@Component({
  selector: 'app-kyc-data',
  imports: [],
  templateUrl: './kyc-data.html',
  styleUrl: './kyc-data.scss'
})
export class KycData {



   downloadImage(data: any) {
console.log(data);

    // this.service.downloadDocs(this.service.docofselectedUser.id, data);

  }
  viewImage(imagePath: string): void {
    // ✅ Opens image in a new browser tab
    window.open(imagePath, '_blank');
  }
}
