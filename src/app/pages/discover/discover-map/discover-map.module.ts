import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscoverMapPageRoutingModule } from './discover-map-routing.module';

import { DiscoverMapPage } from './discover-map.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscoverMapPageRoutingModule,
    SharedModule
  ],
  declarations: [DiscoverMapPage]
})
export class DiscoverMapPageModule {}
