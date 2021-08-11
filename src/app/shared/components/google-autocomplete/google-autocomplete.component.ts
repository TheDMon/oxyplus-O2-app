import { Component, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

import { AddressComponent, Location } from 'src/app/models/location';
import { EventEmitter } from '@angular/core';

declare let google: any;

@Component({
  selector: 'app-google-autocomplete',
  templateUrl: './google-autocomplete.component.html',
  styleUrls: ['./google-autocomplete.component.scss'],
})
export class GoogleAutocompleteComponent implements OnInit {
  @Output() placeChosen = new EventEmitter<Location>();
  autoCompleteService: any;
  placesService: any; // google.maps.places.PlacesService;
  predictedPlaces: any[]; // | google.maps.places.AutocompletePrediction[];
  locationSearchString: string;
  pickedLocation: Location;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.autoCompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(
      document.getElementById('attribution')
    );

    this.pickedLocation = new Location();
  }

  async getPredictions() {
    const center = { lat: 50.064192, lng: -130.605469 }; //dummy center

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    center.lat = position.coords.latitude;
    center.lng = position.coords.longitude;

    // Create a bounding box with sides ~10km away from the center point
    const defaultBounds = {
      north: center.lat + 0.1,
      south: center.lat - 0.1,
      east: center.lng + 0.1,
      west: center.lng - 0.1,
    };

    this.predictedPlaces = [];
    this.autoCompleteService.getPlacePredictions(
      {
        input: this.locationSearchString,
        bounds: defaultBounds,
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'geometry'],
        strictBounds: false,
        types: ['geocode'],
      },
      (predictions, serviceStatus) => {
        this.predictedPlaces = predictions;
      }
    );
  }

  onChosePlace(place) {
    this.placesService.getDetails(
      {
        placeId: place.place_id,
        fields: ['address_components', 'geometry']
      },
      (placeResult, placeServiceStatus) => {
        if (placeResult.geometry){
          this.pickedLocation.position = {
            lat: placeResult.geometry.location.lat(),
            lng: placeResult.geometry.location.lng()
          };

          console.log(placeResult);

          let addressText = '';
          this.pickedLocation.addressComponent = new AddressComponent();
          placeResult.address_components.forEach(addrComp => {
            addressText += ', ' + addrComp.long_name;
            if(addrComp.types[0] === 'street_number'){ //61/1B
              // street_number
              this.pickedLocation.addressComponent.streetNumber = addrComp.long_name;
            } else if(addrComp.types[0] === 'route'){ // adhar das road
              // address line1
              this.pickedLocation.addressComponent.addressLine1 = addrComp.long_name;
            }else if(addrComp.types[0] === 'sublocality_level_2'){ // syampur
              // address line 1
              this.pickedLocation.addressComponent.addressLine1 += ', ' + addrComp.long_name;
            }else if(addrComp.types[0] === 'sublocality_level_3'){ // syampur
              // address line 2
              this.pickedLocation.addressComponent.addressLine2 = addrComp.long_name;
            }else if(addrComp.types[0] === 'sublocality_level_1'){ // budge budge
              // locality
              this.pickedLocation.addressComponent.locality = addrComp.long_name;
            } else if(addrComp.types[0] === 'locality'){ // Kolkata
              // city
              this.pickedLocation.addressComponent.city = addrComp.long_name;
            }
            else if(addrComp.types[0] === 'administrative_area_level_2'){ // south 24 PGS
              // dist
              this.pickedLocation.addressComponent.district = addrComp.long_name;
            }else if(addrComp.types[0] === 'administrative_area_level_1'){ //WB
              // state
              this.pickedLocation.addressComponent.state = addrComp.long_name;
            }else if(addrComp.types[0] === 'country'){ // IN
              //country
              this.pickedLocation.addressComponent.country = addrComp.long_name;
            }else if(addrComp.types[0] === 'postal_code'){ //700137
              //pincode
              this.pickedLocation.addressComponent.pincode = +addrComp.long_name;
            }
          });

          addressText = addressText.substr(2, addressText.length);
          this.pickedLocation.address = addressText;
        } else{
          this.pickedLocation = null;
        }
        this.placeChosen.emit(this.pickedLocation);
        this.modalCtrl.dismiss();
      }
    );
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
