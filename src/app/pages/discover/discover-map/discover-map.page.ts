import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { MapInfoWindow } from 'src/app/models/map-infowindow';
import { MapMarker } from 'src/app/models/map-marker';
import { Request } from 'src/app/models/request';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/pages/login/user.service';
import { MapMyIndiaComponent } from 'src/app/shared/map-my-india/map-my-india.component';
import { DiscoverService } from '../discover.service';

@Component({
  selector: 'app-discover-map',
  templateUrl: './discover-map.page.html',
  styleUrls: ['./discover-map.page.scss'],
})
export class DiscoverMapPage implements OnInit, OnDestroy {
  @ViewChild(MapMyIndiaComponent) map: MapMyIndiaComponent;
  isDonar = false;
  distance: number;
  subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private discoverService: DiscoverService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userService.isDonarProfile.subscribe(
        (isDonar) => (this.isDonar = isDonar)
      )
    );

    this.subscriptions.push(
      this.discoverService.distanceDiscovered.subscribe((distance) => {
        this.distance = distance;
      })
    );
  }

  ionViewDidEnter() {
    // be aware of putting find calls here, mutltiple subs issue ahead
  }

  onMapLoadCompleted(e: any) {
    if (this.isDonar) {
      this.findRequests();
    } else {
      this.findDonars();
    }

    this.loadMapData();
  }

  loadMapData() {
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
    this.discoverService.findDonors().subscribe((donors) => {
      const markers = donors
        .filter(
          (x) => x.address !== undefined && x.address.location !== undefined
        )
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
      this.map.setFocus(this.distance);
    });
  }

  findRequests() {
    this.discoverService.findSubmittedRequests().subscribe((requests) => {
      const markers = requests
        .filter(
          (x) => x.location !== undefined && x.location.location !== undefined
        )
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
      this.map.setFocus(this.distance);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
