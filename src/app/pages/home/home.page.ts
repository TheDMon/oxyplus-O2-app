import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { GoogleMapComponent } from 'src/app/google-map/google-map.component';
import { MapInfoWindow } from 'src/app/models/map-infowindow';
import { MapMarker } from 'src/app/models/map-marker';
import { Request } from 'src/app/models/request';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/pages/login/user.service';
import { MapMyIndiaComponent } from 'src/app/shared/map-my-india/map-my-india.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  //@ViewChild(GoogleMapComponent) gmap: GoogleMapComponent;
  @ViewChild(MapMyIndiaComponent) map: MapMyIndiaComponent;
  isDonar = false;
  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit() {
    //this.userService.isDonarProfile.subscribe(isDonar => this.)
  }

  onMapLoadCompleted(e: any) {
    this.loadMapData();
  }

  loadMapData(){
    this.userService.isDonarProfile
      .pipe(
        take(1),
        map((isDonar) => {
          this.isDonar = isDonar;
          if (!isDonar) {
            this.findDonars();
          } else {
            this.findRequests();
          }
        })
      )
      .subscribe();
  }

  findDonars() {
    this.http
      .get<User[]>(`http://localhost:3000/donar/list`)
      .subscribe((items) => {
        const markers = items
          .filter((x) => x.address !== undefined && x.address.location !== undefined)
          .map((x) => {
            const infoWin = new MapInfoWindow();
            infoWin.title = `${x.firstname} ${x.lastname}`;
            infoWin.addressText = x.address.text;
            infoWin.mobile = x.mobile;

            const m = new MapMarker();
            m.title = `${x.firstname} ${x.lastname}`;
            m.position = x.address.location;
            m.infoWin = infoWin;

            return m;
          });

        this.map.setMarkers(markers);
      });
  }

  findRequests() {
    this.http
      .get<Request[]>(`http://localhost:3000/donar/requests/list`)
      .subscribe((items) => {
        const markers = items
          .filter((x) => x.location !== undefined && x.location.location !== undefined)
          .map((x) => {
            const infoWin = new MapInfoWindow();
            infoWin.title = x.requester;
            infoWin.addressText = x.location.text;
            infoWin.mobile = x.contact;
            //infoWin.email = x.contact;

            const m = new MapMarker();
            m.title = x.requester;
            m.position = x.location.location;
            m.infoWin = infoWin;

            return m;
          });
        this.map.setMarkers(markers);
      });
  }

  onRequestComplete(e: number) {
    //this.map.height = (Number(this.gmap.height) - e).toString();
  }
}
