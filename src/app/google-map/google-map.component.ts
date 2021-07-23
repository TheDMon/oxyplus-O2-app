import { Component, ElementRef, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { MapMarker } from '../models/map-marker';
import { User } from '../models/user';

declare var google: any;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit {
  @ViewChild('map') mapRef: ElementRef;
  @Input() height = '100'; //[style.height.%]="height"
  @Output() onMapLoadCompleted: EventEmitter<boolean> = new EventEmitter<boolean>();
  map: any;
  infoWindow: any;
  bounds: any;
  currentInfoWindow: any;

  constructor() { }

  ngOnInit() {
    this.initMap();
  }

  initMap(){
    this.bounds = new google.maps.LatLngBounds();
    // Try HTML5 geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.map = new google.maps.Map(this.mapRef.nativeElement, {
          center: pos,
          zoom: 15
        });
        this.bounds.extend(pos);

        // eslint-disable-next-line new-parens
        this.infoWindow = new google.maps.InfoWindow;
        this.infoWindow.setContent('Location Found');
        this.infoWindow.open(this.map);

        this.onMapLoadCompleted.emit(true);

      }, () => {
        // Browser supports geolocation, but user has denied permission
        this.handleLocationError(true, this.infoWindow);
      });
    } else {
      // Browser doesn't support geolocation
      this.handleLocationError(false, this.infoWindow);
    }
  }

  // Handle a geolocation error
  handleLocationError(browserHasGeolocation, infoWindow) {
    // Set default location to Sydney, Australia
    const pos = {lat: -33.856, lng: 151.215};
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      center: pos,
      zoom: 15
    });

    // Display an InfoWindow at the map center
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Geolocation permissions denied. Using default location.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(this.map);
    this.currentInfoWindow = infoWindow;
    this.onMapLoadCompleted.emit(true);
  }

  setMarkers(markers: MapMarker[]){
    markers.forEach(item => {
      const marker = new google.maps.Marker({
        label: {
          fontFamily: 'Fontawesome',
          color: '#ffffff',
          text: '\uf299'
        },
        position: item.position,
        map: this.map,
        title: item.title
      });

      // Add click listener to each marker
      google.maps.event.addListener(marker, 'click', () => {
        const infoWindowContent = `<div id="infoWindow">
                                    <div class="title">
                                    <b>${item.infoWin.title}</b></div>
                                    <div class="address">${item.infoWin.addressText}</div>
                                    <div class="contact">${item.infoWin.mobile}</div>
                                  </div>`;
        this.infoWindow.setContent(infoWindowContent);
        this.infoWindow.open(this.map, marker);
      });
      // Adjust the map bounds to include the location of this marker
      this.bounds.extend(marker.getPosition());
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    this.map.fitBounds(this.bounds);

  }

}
