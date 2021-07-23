import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverPage } from './discover.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: DiscoverPage,
    children: [
      {
        path: 'discover-map',
        loadChildren: () => import('./discover-map/discover-map.module').then( m => m.DiscoverMapPageModule)
      },
      {
        path: 'discover-list',
        loadChildren: () => import('./discover-list/discover-list.module').then( m => m.DiscoverListPageModule)
      },
      {
        path: '',
        redirectTo: '/discover/tabs/discover-map',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/discover/tabs/discover-map',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverPageRoutingModule {}
