import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { MapInfoWindow } from 'src/app/models/map-infowindow';
import { MapMarker } from 'src/app/models/map-marker';
import { UserService } from 'src/app/pages/login/user.service';
import { GoogleMapComponent } from '../../../shared/google-map/google-map.component';
import { MapMyIndiaComponent } from 'src/app/shared/map-my-india/map-my-india.component';
import { DiscoverService } from '../discover.service';

@Component({
  selector: 'app-discover-map',
  templateUrl: './discover-map.page.html',
  styleUrls: ['./discover-map.page.scss'],
})
export class DiscoverMapPage implements OnInit, OnDestroy {
  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;
  isDonor = false;
  distance: number;
  subscriptions: Subscription[] = [];
  showLoading = false;

  constructor(
    private userService: UserService,
    private discoverService: DiscoverService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userService.isDonorProfile.subscribe(
        (isDonor) => (this.isDonor = isDonor)
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
    this.loadMapData();
  }

  loadMapData() {
    this.showLoading = true;
    this.userService.isDonorProfile
      .pipe(
        take(1),
        map((isDonar) => {
          this.isDonor = isDonar;
          if (!isDonar) {
            this.findDonars();
          } else {
            this.findRequests();
          }
        })
      )
      .subscribe({
        next:(value) => {
          console.log('emitted value ==>', value);
        },
        complete: () => {
          this.showLoading = false;
        },
        error: (error) => {
          this.showLoading = false;
          console.error(error);
        }
      });
  }

  findDonars() {
    this.discoverService.findDonors().subscribe((donors) => {
      const markers = donors
        .filter(
          (x) => x.location !== undefined && x.location.position !== undefined
        )
        .map((x) => {
          const infoWin = new MapInfoWindow();
          infoWin.title = `${x.name}`;
          infoWin.addressText = x.location.address;
          infoWin.mobile = x.mobile;

          const m = new MapMarker();
          m.title = `${x.name}`;
          m.position = x.location.position;
          m.infoWin = infoWin;

          return m;
        });

      this.map.setMarkers(markers);
      this.map.setFocus(markers); // it was distance before
    });
  }

  findRequests() {
    this.discoverService.findSubmittedRequests().subscribe((requests) => {
      const markers = requests
        .filter(
          (x) => x.location !== undefined && x.location.position !== undefined
        )
        .map((x) => {
          const infoWin = new MapInfoWindow();
          infoWin.title = x.requester;
          infoWin.addressText = x.location.address;
          infoWin.mobile = x.contact;
          //infoWin.email = x.contact;

          const m = new MapMarker();
          m.title = x.requester;
          m.position = x.location.position;
          m.infoWin = infoWin;

          return m;
        });
      this.map.setMarkers(markers);
      this.map.setFocus(markers); // it was distacne before
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
