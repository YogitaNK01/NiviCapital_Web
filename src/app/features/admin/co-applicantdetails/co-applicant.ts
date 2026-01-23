import { CommonModule } from '@angular/common';
import { Component, Type } from '@angular/core';
import { AppTab, Commontabs } from "../../systemdesign/commontabs/commontabs";
import { TAB_CONFIG } from '../../../shared/tab.config';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-co-applicant',
  imports: [CommonModule, Commontabs],
  standalone: true,
  templateUrl: './co-applicant.html',
  styleUrl: './co-applicant.scss'
})
export class CoApplicantDetails {

   selectedTabIndex = 0;
  tabs: AppTab[] = [];
  activeTabComponent!: Type<any>;
  activeTabId = 'pi';

constructor(private route: ActivatedRoute, private router: Router) { }

  async ngOnInit(): Promise<void> {
      //quicklink connectivity
      const page = 'coapplicantdetails';
  
      const pageTabs = TAB_CONFIG.filter(t => t.page.includes(page));
      this.tabs = pageTabs.map(t => ({
        id: t.id,
        label: t.label
      }));
  
      this.route.queryParams.subscribe(params => {
        const key = params['tab'];
        const active =
          pageTabs.find(t => t.routeKey === key) || pageTabs[0];
        
        this.selectedTabIndex = pageTabs.findIndex(t => t.routeKey === active.routeKey );
        console.log("Selected Tab Index:", this.selectedTabIndex);
        this.activeTabComponent = active.component;
          
      });
  
      console.log("loaded data")
     
  
    }

      //individual tabs change
      onTabChange(tab: AppTab) {
        const config = TAB_CONFIG.find(t => t.id === tab.id)!;
    
        this.activeTabComponent = config.component;
    
        this.router.navigate([], {
          queryParams: { tab: config.routeKey },
          queryParamsHandling: 'merge'
        });
      }
  
}
