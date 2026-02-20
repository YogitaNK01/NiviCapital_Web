import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Dropdown, DropdownOption } from '../../features/systemdesign/dropdown/dropdown';
import { Main } from '../service/main';
import { AddCustomer } from "../../features/admin/customer/add-customer/add-customer";

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  expanded?: boolean;
  iconActive?: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterModule, CommonModule, Dropdown, AddCustomer],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Layout implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;

  sidebarOpen = true;
  isMobile = false;
  menuItems: MenuItem[] = [];

  @Input() avatarUrl = 'https://i.pravatar.cc/40?img=12';
  @Input() hasAvatar = true;

  selectedOption: string = '';

  systemdesignMenu: MenuItem[] = [
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/buttons', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Inputfield', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/inputfield', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Charts', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/charts', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Dropdown', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/dropdown', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Checkbox', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/checkbox', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Radio Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/radiobuttons', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Upload Buttons', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/uploadbuttons', expanded: false },
    { icon: '/assets/images/sidemenu/dashboard.svg', label: 'Date Picker', iconActive: '/assets/images/sidemenu/dashboard-active.svg', route: '/systemdesign/datepicker', expanded: false },
  ];

  adminMenu: MenuItem[] = [
    { icon: '/assets/images/sidemenu/dashboard.svg', iconActive: '/assets/images/sidemenu/dashboard-active.svg', label: 'Dashboard', route: '/admin/dashboard', expanded: false },
    { icon: '/assets/images/sidemenu/user.svg', iconActive: '/assets/images/sidemenu/user-active.svg', label: 'Customer', route: '/admin/customer', expanded: false },
    { icon: '/assets/images/sidemenu/user.svg', iconActive: '/assets/images/sidemenu/user-active.svg', label: 'Add loan', route: '/admin/losoperation/newloan', expanded: false },

    { icon: '/assets/images/sidemenu/money-recive.svg', iconActive: '/assets/images/sidemenu/money-recive-active.svg', label: 'Loan Operations', route: '/admin/losoperation', expanded: false },
    { icon: '/assets/images/sidemenu/user.svg', iconActive: '/assets/images/sidemenu/user-active.svg', label: 'Customer Details', route: '/admin/customerdetails', expanded: false },
    { icon: '/assets/images/sidemenu/money-recive.svg', iconActive: '/assets/images/sidemenu/money-recive-active.svg', label: 'Loan Details', route: '/admin/losdetails', expanded: false },
         { icon: '/assets/images/sidemenu/money-recive.svg', iconActive: '/assets/images/sidemenu/money-recive-active.svg', label: 'Co-applicant', route: '/admin/coapplicantdetails', expanded: false },

    { icon: '/assets/images/sidemenu/candle.svg', iconActive: '/assets/images/sidemenu/money-recive-active.svg', label: 'FX Operations', route: '/admin/customer2', expanded: false },
    { icon: '/assets/images/sidemenu/wallet-money.svg', label: 'LMS', route: '/admin/customer2', expanded: false },
    { icon: '/assets/images/sidemenu/document-upload.svg', label: 'Documents', route: '/admin/customer2', expanded: false },
    { icon: '/assets/images/sidemenu/tag-user.svg', label: 'Communication', route: '/admin/dashboard3', expanded: false },
    { icon: '/assets/images/sidemenu/cpu-setting.svg', label: 'Configuration', route: '/admin/customer3', expanded: false },
    { icon: '/assets/images/sidemenu/profile-circle.svg', label: 'User Management', route: '/admin/dashboard4', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'Analytics', route: '/admin/customer4', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'Products', route: '/admin/customer5', expanded: false },
    { icon: '/assets/images/sidemenu/note.svg', label: 'System Design', route: 'systemdesign/buttons', expanded: false },
  ];

  myOptions: DropdownOption[] = [
    { label: 'Manage Account', value: 'manageaccount', icon: '/assets/images/sidemenu/user.svg' },
    { label: 'Change Password', value: 'changepassword', icon: '/assets/images/icons/lock.svg' },
    { label: 'Activity Log', value: 'activitylog', icon: '/assets/images/icons/lock.svg' },
    { label: 'Logout', value: 'logout', icon: '/assets/images/icons/logout-icon.svg' }
  ];



  constructor(private router: Router, private service: Main) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateMenu(event.urlAfterRedirects);
      });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 769;
    this.sidebarOpen = !this.isMobile;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private updateMenu(url: string): void {
    if (url.startsWith('/systemdesign')) {
      this.menuItems = this.systemdesignMenu;
    } else if (url.startsWith('/admin')) {
      this.menuItems = this.adminMenu;
    } else {
      this.menuItems = [];
    }
  }

  onSelectionChange(value: string): void {
    if (value === 'logout') {
      this.logout();
    }
  }

   logout(): void {
    this.service.Logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout error:', err);
          this.router.navigate(['/login']);
        }
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}
