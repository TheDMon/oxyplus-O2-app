import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';

//declare var L: any;

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss'],
})
export class LeafletMapComponent implements OnInit {
  @ViewChild('map') mapRef: ElementRef;

  constructor() {}

  ngOnInit() {
    console.log(this.mapRef);
    //var div = document.getElementById('map');
    const mymap = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer(
      `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`,
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: environment.mapBoxToken,
        crossOrigin: true
      }
    ).addTo(mymap);

    //mymap.locate({setView: true, maxZoom: 16});
  }
}
