import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AutocompleteResultComponent } from './components/autocomplete-result/autocomplete-result.component';
import { GoogleAutocompleteComponent } from './components/google-autocomplete/google-autocomplete.component';
import { GoogleMapComponent } from './google-map/google-map.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { LocationAutosuggestComponent } from './location-autosuggest/location-autosuggest.component';
import { MapMyIndiaComponent } from './map-my-india/map-my-india.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [
    GoogleMapComponent,
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
    GoogleAutocompleteComponent,
    AutocompleteResultComponent,
  ],
  exports: [
    GoogleMapComponent,
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
    GoogleAutocompleteComponent
  ],
})
export class SharedModule {}
