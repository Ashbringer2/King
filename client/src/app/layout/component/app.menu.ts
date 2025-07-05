// src/app/app.menu.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
          <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
          <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
  </ul>`
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      // Home section
      {
        label: 'Home',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        ]
      },
            // Invoices & Related section
      {
        label: 'Invoices',
        items: [
          { label: 'Invoices',     icon: 'pi pi-fw pi-money-bill',      routerLink: ['/invoices'] },
          { label: 'Transactions', icon: 'pi pi-fw pi-arrows-h',        routerLink: ['/transactions'] },
          { label: 'Types',        icon: 'pi pi-fw pi-tags',            routerLink: ['/types'] }
        ]
      },
      // UI Components section
      {
        label: 'UI Components',
        items: [
          { label: 'Form Layout', icon: 'pi pi-fw pi-id-card',       routerLink: ['/uikit/formlayout'] },
          { label: 'Input',       icon: 'pi pi-fw pi-check-square',  routerLink: ['/uikit/input']      },
          { label: 'Button',      icon: 'pi pi-fw pi-mobile',        routerLink: ['/uikit/button']     },
          { label: 'Table',       icon: 'pi pi-fw pi-table',         routerLink: ['/uikit/table']      },
          { label: 'List',        icon: 'pi pi-fw pi-list',          routerLink: ['/uikit/list']       },
          { label: 'Tree',        icon: 'pi pi-fw pi-share-alt',     routerLink: ['/uikit/tree']       },
          { label: 'Panel',       icon: 'pi pi-fw pi-tablet',        routerLink: ['/uikit/panel']      },
          { label: 'Overlay',     icon: 'pi pi-fw pi-clone',         routerLink: ['/uikit/overlay']    },
          { label: 'Media',       icon: 'pi pi-fw pi-image',         routerLink: ['/uikit/media']      },
          { label: 'Menu',        icon: 'pi pi-fw pi-bars',          routerLink: ['/uikit/menu']       },
          { label: 'Message',     icon: 'pi pi-fw pi-comment',       routerLink: ['/uikit/message']    },
          { label: 'File',        icon: 'pi pi-fw pi-file',          routerLink: ['/uikit/file']       },
          { label: 'Chart',       icon: 'pi pi-fw pi-chart-bar',     routerLink: ['/uikit/charts']     },
          { label: 'Timeline',    icon: 'pi pi-fw pi-calendar',      routerLink: ['/uikit/timeline']   },
          { label: 'Misc',        icon: 'pi pi-fw pi-circle',        routerLink: ['/uikit/misc']       }
        ]
      },
      // Pages section
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Landing',     icon: 'pi pi-fw pi-globe',           routerLink: ['/landing'] },
          {
            label: 'Auth',        icon: 'pi pi-fw pi-user',
            items: [
              { label: 'Login',           icon: 'pi pi-fw pi-sign-in',       routerLink: ['/auth/login'] },
              { label: 'Error',           icon: 'pi pi-fw pi-times-circle',  routerLink: ['/auth/error'] },
              { label: 'Access Denied',   icon: 'pi pi-fw pi-lock',         routerLink: ['/auth/access'] }
            ]
          },
          { label: 'Crud',        icon: 'pi pi-fw pi-pencil',           routerLink: ['/pages/crud']     },
          { label: 'Not Found',   icon: 'pi pi-fw pi-exclamation-circle',routerLink: ['/pages/notfound'] },
          { label: 'Empty',       icon: 'pi pi-fw pi-circle-off',       routerLink: ['/pages/empty']    }
        ]
      },
      // Hierarchy & Get Started sections omitted for brevity…
    ];
  }
}
