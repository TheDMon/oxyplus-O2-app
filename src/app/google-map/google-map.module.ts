import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapComponent } from './google-map.component';
import { LocationAutocompleteComponent } from './location-autocomplete.component';

@NgModule({
    declarations: [GoogleMapComponent, LocationAutocompleteComponent],
    entryComponents: [],
    imports: [
      CommonModule,
      FormsModule
    ],
    exports: [GoogleMapComponent, LocationAutocompleteComponent]
  })
  export class GoogleMapModule {}
