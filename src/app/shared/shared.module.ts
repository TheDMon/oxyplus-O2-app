import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AutocompleteResultComponent } from './components/autocomplete-result/autocomplete-result.component';
import { GoogleAutocompleteComponent } from './components/google-autocomplete/google-autocomplete.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { LocationAutosuggestComponent } from './location-autosuggest/location-autosuggest.component';
import { MapMyIndiaComponent } from './map-my-india/map-my-india.component';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
    GoogleAutocompleteComponent,
    AutocompleteResultComponent,
  ],
  exports: [
    LeafletMapComponent,
    MapMyIndiaComponent,
    LocationAutosuggestComponent,
    GoogleAutocompleteComponent
  ],
})
export class SharedModule {}
