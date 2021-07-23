import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoverListPageRoutingModule } from './discover-list-routing.module';

import { DiscoverListPage } from './discover-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscoverListPageRoutingModule
  ],
  declarations: [DiscoverListPage]
})
export class DiscoverListPageModule {}
