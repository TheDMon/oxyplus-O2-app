import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { MapMarker } from 'src/app/models/map-marker';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let MapmyIndia: any;
declare let L: any;

@Component({
  selector: 'app-map-my-india',
  templateUrl: './map-my-india.component.html',
  styleUrls: ['./map-my-india.component.scss'],
})
export class MapMyIndiaComponent implements OnInit {
  @Output() loadCompleted = new EventEmitter<boolean>();
  map: any;
  currentPosition: any;
  addedMarkers: any[] = [];
  addedFocusCircles: any[] = [];

  constructor() {}

  ngOnInit() {
    //var marker = L.marker([28.549948, 77.268241]).addTo(this.map);
    this.initMap();
  }

  initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        this.currentPosition = pos;

        this.map = new MapmyIndia.Map('map', {
          center: pos,
          zoom: 15,
        });

        this.loadCompleted.emit(true);
      });
    }
  }

  setMarkers(markers: MapMarker[]) {
    // let's remove already present markers first
    this.addedMarkers.forEach((marker) => {
      this.map.removeLayer(marker);
    });

    // now lets add markers
    markers.forEach((item) => {
      const infoWindowContent = `<div id="infoWindow">
                                    <div class="title">
                                    <b>${item.infoWin.title}</b></div>
                                    <div class="address">${item.infoWin.addressText}</div>
                                    <div class="contact">${item.infoWin.mobile}</div>
                                  </div>`;

      const marker = L.marker(item.position);
      this.addedMarkers.push(marker); // let's store the markers so that we can remove it afterwards
      marker.bindPopup(infoWindowContent);
      this.map.addLayer(marker);
    });
  }

  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. Trying a hack here*/
  setFocus(distanceRad: number) {
    // let's remove added circles
    this.addedFocusCircles.forEach((c) => this.map.removeLayer(c));

    // let's add now
    const radius = distanceRad * 1000;

    const currentDiameter = L.circle(this.currentPosition, {
      color: 'transparent',
      fillColor: 'transparent',
      // fillOpacity: 0.5,
      radius: radius || 10000,
    });

    currentDiameter.addTo(this.map);
    this.addedFocusCircles.push(currentDiameter); // storing it so that we can remove later
    this.map.fitBounds(currentDiameter.getBounds());
  }
}
