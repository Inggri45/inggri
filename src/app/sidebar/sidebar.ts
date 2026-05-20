import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements AfterViewInit, OnDestroy {
  @Input() moduleName: string = "";

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
