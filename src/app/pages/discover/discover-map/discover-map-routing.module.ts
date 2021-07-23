import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverMapPage } from './discover-map.page';

const routes: Routes = [
  {
    path: '',
    component: DiscoverMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverMapPageRoutingModule {}
