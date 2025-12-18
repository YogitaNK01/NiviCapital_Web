import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Inputfield } from '../../systemdesign/inputfield/inputfield';
import { Dropdown, DropdownOption } from '../../systemdesign/dropdown/dropdown';
import { Buttons } from '../../systemdesign/buttons/buttons';
import { Charts } from '../../systemdesign/charts/charts';
import { Barcharts } from '../../systemdesign/barcharts/barcharts';
import { Areacharts, AreaDataset } from '../../systemdesign/areacharts/areacharts';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Inputfield, Dropdown, Buttons, Charts, Barcharts, Areacharts],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  chartWidth = window.innerWidth < 480 ? 250 : window.innerWidth < 550 ? 400 : window.innerWidth < 1450 ? 300: 500;
  chartheight = window.innerWidth < 480 ? 300 : window.innerWidth < 550 ? 350: 400;
private resizeHandler = () => this.setChartWidth();

  ngOnInit() {
    this.setChartWidth();
    window.addEventListener('resize', () => this.resizeHandler());
  }

  setChartWidth1() {
    this.chartWidth = window.innerWidth < 480 ? 250 : window.innerWidth < 550 ? 400: window.innerWidth < 1450 ? 300: 500;
    this.chartheight = window.innerWidth < 480 ? 300 : window.innerWidth < 550 ? 350: 400;
  }

  setChartWidth() {
  const w = window.innerWidth;

  if (w < 480) {
    this.chartWidth = 250;
    this.chartheight = 300;
  } else if (w < 550) {
    this.chartWidth = 400;
    this.chartheight = 350;
  } else if (w < 780) {
    this.chartWidth = 500;
    this.chartheight = 400;
  } else if (w < 1450) {
    this.chartWidth = 300;
    this.chartheight = 400;
  } else {
    this.chartWidth = 500;
    this.chartheight = 400;
  }
}


  alerts = [
    {
      type: 'success',
      message: 'Application EDU12456 has been successfully activated with disbursement of ₹5,00,000.'
    },
    {
      type: 'info',
      message: 'EDU65712 disbursement of ₹8,00,000 has been completed successfully.'
    },
    {
      type: 'warning',
      message: '2 applications (EDU23478, EDU58900) are pending review. Review pending applications.'
    },
    {
      type: 'danger',
      message: 'Application EDU34890 has been rejected due to incomplete documentation.'
    }
  ];

  //dropdown

  // @Input() avatarUrl='https://i.pravatar.cc/40?img=12';
  // @Input() hasAvatar = true;

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

  //key metrics data
  keyMetrics = [
    { label: 'Active Applications', value: '1,247', change: '12% from last month' },
    { label: 'Total Disbursements', value: '₹2.4 Cr', change: '8% from last month' },
    { label: 'System Performance', value: '99.9%', change: 'Target achieved' }
  ];

  // Chart 1 Data
  chartData1 = [
    { label: 'Approved', value: 60, color: '#3B8439' },
    { label: 'Pending', value: 10, color: '#FA0' },
    { label: 'Under Review', value: 10, color: '#0476BC' },
    { label: 'Rejected', value: 20, color: '#CA0001' },
  ];

  //bar chart

  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  barDatasets = [
    { values: [78, 60, 118, 50, 78, 42], color: '#F33B48' },
    { values: [48, 80, 75, 40, 35, 100], color: '#0D4472' }
  ];

  //area chart

  weekLabelsarea = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  areaDatasetsarea: AreaDataset[] = [
    {
      data: [65, 45, 35, 75, 25, 90, 60, 65, 55, 100],
      fillColor: '#e8b4b8',
      strokeColor: '#d63447',
    },
    {
      data: [20, 40, 30, 40, 90, 70, 80, 70, 60, 50],
      fillColor: '#b8d4e8',
      strokeColor: '#4a90d9',
    }
  ];
  // Adjust tension for smoother/sharper curves
  tension = 0.4; // Try values between 0.2-0.5

  ngOnDestroy() {
  window.removeEventListener('resize', this.resizeHandler);
}
}
