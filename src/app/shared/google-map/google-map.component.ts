import { AfterViewInit, EventEmitter, OnDestroy } from '@angular/core';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

import { Coordinate } from '../../models/location';
import { MapMarker } from '../../models/map-marker';

declare let google: any;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
})
export class GoogleMapComponent implements AfterViewInit {
  @ViewChild('map') mapRef: ElementRef;
  @Output() loadCompleted = new EventEmitter<boolean>();

  map: any;
  bounds: any;
  addedMarkers: any[] = [];
  addedInfoWindows: any[] = [];

  constructor() { }

  ngAfterViewInit(){
    this.initMap();
  }

  initMap() {
    this.bounds = new google.maps.LatLngBounds();
    if (navigator.geolocation) {

      Geolocation.getCurrentPosition().then((position) => {
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
    this.addedMarkers.forEach(marker => marker.setMap(null));

    // now lets add markers
    markers.forEach((item) => {
      const infoWindowContent = `<div id="infoWindow">
                                    <div class="title">
                                    <b>${item.infoWin.title}</b></div>
                                    <div class="contact"><a href="tel:${item.infoWin.mobile}">${item.infoWin.mobile}</a></div>
                                    <div class="address">${item.infoWin.addressText}</div>
                                    <div><a target="_blank" href="https://maps.google.com/maps?daddr=${item.position.lat},${item.position.lng}&amp;ll=">
                                    <span> View on Google Maps </span> </a></div>
                                  </div>`;

      const markerText = item.type === 'donor' ? 'O2' : '\uf0f9';//'\uf299';
      const marker = new google.maps.Marker({
        label: {
          fontFamily: 'Fontawesome',
          color: '#ffffff',
          text: markerText
        },
        position: item.position,
        map: this.map,
        title: item.title
      });

      // Add click listener to each marker
      google.maps.event.addListener(marker, 'click', () => {
        this.addedInfoWindows.forEach(infoWin => infoWin.close());
        const infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(this.map, marker);
        this.addedInfoWindows.push(infoWindow);
      });

      this.addedMarkers.push(marker);
    });

  }

  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. Trying a hack here*/
  setFocus(markers: MapMarker[]) {
    this.bounds = new google.maps.LatLngBounds();
    markers.forEach(marker => this.bounds.extend(marker.position));
    this.map.fitBounds(this.bounds);
  }
}

