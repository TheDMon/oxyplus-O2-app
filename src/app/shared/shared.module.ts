import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { MapMyIndiaComponent } from './map-my-india/map-my-india.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LeafletMapComponent, MapMyIndiaComponent],
  exports: [LeafletMapComponent, MapMyIndiaComponent],
})
export class SharedModule {}
