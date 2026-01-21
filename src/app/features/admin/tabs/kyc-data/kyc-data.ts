import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../core/service/main';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kyc-data',
  imports: [CommonModule],
  templateUrl: './kyc-data.html',
  styleUrl: './kyc-data.scss'
})
export class KycData implements OnInit {
  allkycdata: any;
  kycdata: any;
  kycDocs:any;


  constructor(private service: Main) { }

  ngOnInit() {
    this.allkycdata = this.service.get_pi_KycData();
    console.log("---kycdata---", this.allkycdata)
    this.kycdata = this.allkycdata.kycDocuments;
    console.log("---kycdata---", this.kycdata)

    this.kycDocs = this.kycdata.map((doc: any) => ({
    label: doc.docType,
    fileName: doc.fileName,
    viewUrl: doc.viewUrl
  }));
  }

 downloadImage(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  a.click();
}

  viewImage(url: string): void {
    // ✅ Opens image in a new browser tab
    window.open(url, '_blank');
  }
}
