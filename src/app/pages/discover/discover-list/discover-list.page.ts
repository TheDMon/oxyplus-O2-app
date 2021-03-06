import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Coordinate } from 'src/app/models/location';
import { Request } from 'src/app/models/request';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/pages/login/user.service';
import { RequestDetailComponent } from '../../request/components/request-details/request-detail.component';
import { DiscoverService } from '../discover.service';

@Component({
  selector: 'app-discover-list',
  templateUrl: './discover-list.page.html',
  styleUrls: ['./discover-list.page.scss'],
})
export class DiscoverListPage implements OnInit, OnDestroy {
  requests: Request[];
  donors: User[];
  isDonor: boolean;
  subscriptions: Subscription[] = [];

  constructor(
    private discoverService: DiscoverService,
    private userService: UserService,
    private modalCtrl: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userService.isDonorProfile
        .pipe(
          switchMap((isDonor) => {
            this.isDonor = isDonor;
            return this.discoverService.discoveredRequests; // subscribe requests
          }),
          switchMap((requests) => {
            this.requests = requests;
            return this.discoverService.discoveredDonors; // subscribe donors
          })
        )
        .subscribe((donors) => {
          this.donors = donors;
          if (this.donors.length === 0 && this.requests.length === 0) {
            // in case none present, redirect to map view
            this.router.navigate(['/', 'discover', 'tabs', 'discover-map']);
          }
        })
    );
  }

  onRequestClicked(requestItem: Request) {
    this.modalCtrl
      .create({
        component: RequestDetailComponent,
        componentProps: {
          request: requestItem,
        },
      })
      .then((elem) => elem.present());
  }

  mapsSelector(position: Coordinate) {
    if (
      /* if we're on iOS, open in Apple Maps */
      navigator.platform.indexOf('iPhone') !== -1 ||
      navigator.platform.indexOf('iPad') !== -1 ||
      navigator.platform.indexOf('iPod') !== -1
    ) {
      window.open(
        `maps://maps.google.com/maps?daddr=${position.lat},${position.lng}&amp;ll=`
      );
    } /* else use Google */ else {
      window.open(
        `https://maps.google.com/maps?daddr=${position.lat},${position.lng}&amp;ll=`
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
