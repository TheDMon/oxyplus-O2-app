import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { LocationAutosuggestComponent } from './location-autosuggest/location-autosuggest.component';
import { MapMyIndiaComponent } from './map-my-india/map-my-india.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
  ],
  exports: [
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
  ],
})
export class SharedModule {}
