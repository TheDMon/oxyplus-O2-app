import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewRequestPageRoutingModule } from './new-request-routing.module';

import { NewRequestPage } from './new-request.page';
import { GoogleMapModule } from 'src/app/google-map/google-map.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewRequestPageRoutingModule,
    GoogleMapModule
  ],
  declarations: [NewRequestPage]
})
export class NewRequestPageModule {}
