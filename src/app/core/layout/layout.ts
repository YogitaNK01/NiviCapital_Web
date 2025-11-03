import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Dropdown, DropdownOption } from '../../features/systemdesign/dropdown/dropdown';


interface MenuItem {
  icon: string;
  label: string;
  route: string;
  expanded?: boolean;
  iconActive?: string; // make it optional


}

@Component({
  selector: 'app-layout',
  imports: [RouterModule, CommonModule, Dropdown],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
})
export class Layout {

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateMenu(event.urlAfterRedirects);
      });
  }

  //================================sidemenu for system design===============================================

  sidebarOpen = true;

  menuItems: MenuItem[] = [];

  systemdesignMenu: MenuItem[] = [
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/buttons', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Inputfield', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/inputfield', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Charts', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/charts', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Dropdown', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/dropdown', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Checkbox', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/checkbox', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Radio Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/radiobuttons', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Upload Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/uploadbuttons', expanded: false },

  ];

  adminMenu: MenuItem[] = [
    { icon: '/assets/images/sidemenu/dashboard.svg', iconActive: '/assets/images/sidemenu/dashboard-active.svg', label: 'Dashbboard', route: '/admin/dashboard', expanded: false },
    { icon: '/assets/images/sidemenu/user.svg', iconActive: '/assets/images/sidemenu/user-active.svg', label: 'Customer', route: '/admin/customer', expanded: false },
    { icon: '/assets/images/sidemenu/money-recive.svg', iconActive: '/assets/images/sidemenu/money-recive.svg', label: 'Loan Operations', route: '/admin/customerdetails1', expanded: false },
    { icon: '/assets/images/sidemenu/candle.svg', label: 'FX Operations', route: '/admin/customer1', expanded: false },
    { icon: '/assets/images/sidemenu/wallet-money.svg', label: 'LMS', route: '/admin/dashboard2', expanded: false },
    { icon: '/assets/images/sidemenu/document-upload.svg', label: 'Documents', route: '/admin/customer2', expanded: false },
    { icon: '/assets/images/sidemenu/tag-user.svg', label: 'Communication', route: '/admin/dashboard3', expanded: false },
    { icon: '/assets/images/sidemenu/cpu-setting.svg', label: 'Configuration', route: '/admin/customer3', expanded: false },
    { icon: '/assets/images/sidemenu/profile-circle.svg', label: 'User Management', route: '/admin/dashboard4', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'Analytics', route: '/admin/customer4', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'Products', route: '/admin/customer5', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'System Design', route: 'systemdesign/buttons', expanded: false },

  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }


  updateMenu(url: string) {
    if (url.startsWith('/systemdesign')) {
      this.menuItems = this.systemdesignMenu;
    } else if (url.startsWith('/admin')) {
      this.menuItems = this.adminMenu;
    } else {
      this.menuItems = []; // fallback
    }
  }

  //dropdown

  @Input() avatarUrl = 'https://i.pravatar.cc/40?img=12';
  @Input() hasAvatar = true;

  selectedOption: string = '';
  myOptions: DropdownOption[] = [
    { label: 'Manage Account', value: 'manageaccount', icon: '/assets/images/sidemenu/user.svg' },
    { label: 'Change Password', value: 'changepassword', icon: '/assets/images/icons/lock.svg' },
    { label: 'Activity Log', value: 'activitylog', icon: '/assets/images/icons/lock.svg' },
    { label: 'Logout', value: 'logout', icon: '/assets/images/icons/logout-icon.svg' }
  ];

  onSelectionChange(value: any) {
    console.log('Selected:1', value);
   if(value == 'logout'){
    this.logout()
   }
  }

  logout() {
    this.router.navigate(['/login'])
  }
}
