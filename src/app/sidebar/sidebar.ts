import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_COOKIE_USER_ID, decryptUserId } from '../auth-crypto';

declare const $: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit, AfterViewInit, OnDestroy {
  @Input() moduleName = '';
  username = '';
  private _header: HTMLElement | null = null;

  constructor(private cookieService: CookieService, private router: Router) {}

  ngOnInit(): void {
    const savedUserId = decryptUserId(this.cookieService.get(AUTH_COOKIE_USER_ID));
    this.username = savedUserId === 'idmana' ? 'Inggri Eka Pratiwi' : savedUserId || 'Inggri Eka Pratiwi';
    this._header = document.querySelector('.main-header');
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const saved = localStorage.getItem('adminlte-theme');
    const isDark = saved === 'dark';
    document.body.classList.toggle('dark-mode', isDark);

    if (!this._header) {
      return;
    }

    if (isDark) {
      this._header.classList.remove('navbar-white', 'navbar-light');
      this._header.classList.add('navbar-dark', 'navbar-primary');
    } else {
      this._header.classList.remove('navbar-dark', 'navbar-primary');
      this._header.classList.add('navbar-white', 'navbar-light');
    }
  }

  ngAfterViewInit(): void {
    if (typeof $ === 'undefined') {
      return;
    }

    setTimeout(() => {
      if (typeof $.fn?.Treeview === 'function') {
        $('[data-widget="treeview"]').Treeview('init');
      }

      if (typeof $.fn?.PushMenu === 'function') {
        $('[data-widget="pushmenu"]').PushMenu();
      }

      this.bindMobileSidebarOverlayClose();
    }, 0);
  }

  toggleTheme(): void {
    const isDark = document.body.classList.toggle('dark-mode');

    if (!this._header) {
      this._header = document.querySelector('.main-header');
    }

    if (this._header) {
      if (isDark) {
        this._header.classList.remove('navbar-white', 'navbar-light');
        this._header.classList.add('navbar-dark', 'navbar-primary');
      } else {
        this._header.classList.remove('navbar-dark', 'navbar-primary');
        this._header.classList.add('navbar-white', 'navbar-light');
      }
    }

    localStorage.setItem('adminlte-theme', isDark ? 'dark' : 'light');
  }

  confirmLogout(event: Event): void {
    event.preventDefault();

    const confirmed = window.confirm('Yakin ingin keluar?');
    if (!confirmed) {
      return;
    }

    this.cookieService.deleteAll();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (typeof $ !== 'undefined') {
      $(document).off('click.sidebarOverlayClose');
    }
  }

  private bindMobileSidebarOverlayClose(): void {
    $(document).off('click.sidebarOverlayClose');

    $(document).on('click.sidebarOverlayClose', (event: any) => {
      if ($(window).width() > 992) {
        return;
      }

      if (!$('body').hasClass('sidebar-open')) {
        return;
      }

      const target = $(event.target);
      if (target.closest('.main-sidebar').length > 0) {
        return;
      }

      if (target.closest('[data-widget="pushmenu"]').length > 0) {
        return;
      }

      if (typeof $.fn?.PushMenu === 'function') {
        $('[data-widget="pushmenu"]').PushMenu('collapse');
      } else {
        $('body').removeClass('sidebar-open');
      }
    });
  }
}
