import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverListPage } from './discover-list.page';

const routes: Routes = [
  {
    path: '',
    component: DiscoverListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverListPageRoutingModule {}
