import { AfterViewInit } from '@angular/core';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

import { Location } from '../models/location';

declare let google: any;

@Component({
  selector: 'app-location-autocomplete',
  templateUrl: './location-autocomplete.component.html',
  styleUrls: ['./location-autocomplete.component.scss'],
})
export class LocationAutocompleteComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() location: Location;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onChange = new EventEmitter<Location>();
  addressText: string;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    if(!this.location) {
      this.location = new Location();
    }

    this.addressText = this.location.address;

    this.bindGoogleAutocomplete();
  }

  ngOnChanges(){
    this.addressText = this.location?.address; // let's change address if parent component sends a different one
  }

  bindGoogleAutocomplete(){
    const center = { lat: 50.064192, lng: -130.605469 }; //dummy center

    Geolocation.getCurrentPosition().then(pos => {
       center.lat = pos.coords.latitude;
       center.lng = pos.coords.longitude;

       // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
          north: center.lat + 0.1,
          south: center.lat - 0.1,
          east: center.lng + 0.1,
          west: center.lng - 0.1,
        };

        const options = {
          bounds: defaultBounds,
          componentRestrictions: { country: 'in' },
          fields: ['address_components', 'geometry', 'icon', 'name'],
          strictBounds: false,
          types: ['geocode'],
        };

        const addrInput = document.getElementById('address')
                                  .getElementsByTagName('Input')[0];
        const autocomplete = new google.maps.places.Autocomplete(addrInput, options);

        google.maps.event.addListener(autocomplete, 'place_changed',() => {
          const place = autocomplete.getPlace();

          if (place.geometry){
            this.location.position = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };

            let addressText = '';
            place.address_components.forEach(addrComp => {
              addressText += ', ' + addrComp.long_name;
            });

            addressText = addressText.substr(2, addressText.length);
            this.location.address = addressText;
          } else{
            this.location = null;
          }
          console.log('selected location:', this.location);
          this.onChange.emit(this.location);
        });

    });

  }


}
