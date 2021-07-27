import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AutocompleteResultComponent } from '../autocomplete-result/autocomplete-result.component';

declare let google: any;

@Component({
  selector: 'app-google-autocomplete',
  templateUrl: './google-autocomplete.component.html',
  styleUrls: ['./google-autocomplete.component.scss'],
})
export class GoogleAutocompleteComponent implements OnInit {
  autoCompleteService: any;
  predictedPlaces: any[]; // | google.maps.places.AutocompletePrediction[];
  locationSearchString: string;
  // popoverEl: any;

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {
    this.autoCompleteService = new google.maps.places.AutocompleteService();
    // this.popoverEl = this.popoverCtrl.create({
    //   component: AutocompleteResultComponent,
    //   componentProps: {
    //     autocompleteResult: this.predictedPlaces,
    //   },
    // });
  }

  getPredictions() {
    this.predictedPlaces = [];
    this.autoCompleteService.getPlacePredictions(
      {
        input: this.locationSearchString,
        //bounds: defaultBounds,
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'geometry', 'icon', 'name'],
        strictBounds: false,
        types: ['geocode'],
      },
      (predictions, serviceStatus) => {
        this.predictedPlaces = predictions;
        console.log(this.predictedPlaces);
        console.log('google places service status : ' + serviceStatus);
        this.popoverCtrl
          .create({
            component: AutocompleteResultComponent,
            componentProps: {
              autocompleteResult: this.predictedPlaces,
            }
          })
          .then((popoverEl) => popoverEl.present());
      }
    );
  }
}
