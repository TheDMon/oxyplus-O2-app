import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestPageRoutingModule } from './request-routing.module';

import { RequestPage } from './request.page';
import { RequestDetailComponent } from './components/request-details/request-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestPageRoutingModule,
  ],
  declarations: [
    RequestPage,
    RequestDetailComponent
  ],
  exports: []
})
export class RequestPageModule {}
