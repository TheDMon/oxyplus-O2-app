import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
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
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.userService.isDonorProfile.subscribe((isDonor) => {
        this.isDonor = isDonor;
      })
    );

    // subscribe requesters
    this.subscriptions.push(
      this.discoverService.discoveredRequests.subscribe((requests) => {
        this.requests = requests;
      })
    );

    // subscribe donors
    this.subscriptions.push(
      this.discoverService.discoveredDonors.subscribe((donors) => {
        this.donors = donors;
      })
    );
  }

  onRequestClicked(requestItem: Request){
    this.modalCtrl
      .create({
        component: RequestDetailComponent,
        componentProps: {
          request: requestItem,
        },
      })
      .then((elem) => elem.present());
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
