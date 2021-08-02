import { AfterViewInit, EventEmitter } from '@angular/core';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { MapMarker } from 'src/app/models/map-marker';

declare let google: any;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapRef: ElementRef;
  @Output() loadCompleted = new EventEmitter<boolean>();

  map: any;
  bounds: any;
  addedMarkers: any[] = [];

  constructor() { }

  ngOnInit() {
  }
  
  ngAfterViewInit(){
    this.initMap();
  }

  initMap() {
    this.bounds = new google.maps.LatLngBounds();
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.map = new google.maps.Map(this.mapRef.nativeElement, {
          center: pos,
          zoom: 15
        });

        this.bounds.extend(pos);
        this.loadCompleted.emit(true);
      });
    }
  }

  setMarkers(markers: MapMarker[]) {
    //clear markers
    this.addedMarkers = [];

    // now lets add markers
    markers.forEach((item) => {
      const infoWindowContent = `<div id="infoWindow">
                                    <div class="title">
                                    <b>${item.infoWin.title}</b></div>
                                    <div class="address">${item.infoWin.addressText}</div>
                                    <div class="contact">${item.infoWin.mobile}</div>
                                  </div>`;

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
        const infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(this.map, marker);
      });

      this.addedMarkers.push(marker);
    });

  }

  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. Trying a hack here*/
  setFocus(distanceRad: number) {
    this.bounds = new google.maps.LatLngBounds();
    this.addedMarkers.forEach(marker => this.bounds.extend(marker.getPosition()));
    this.map.fitBounds(this.bounds);
  }
}
