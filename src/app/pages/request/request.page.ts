/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';

import { UserService } from 'src/app/pages/login/user.service';
import { Request } from 'src/app/models/request';
import { RequestService } from 'src/app/pages/request/request.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { RequestDetailComponent } from './components/request-details/request-detail.component';

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})
export class RequestPage implements OnInit, OnDestroy {
  requestType: string;
  allRequests: Request[];
  requests: Request[];
  isDonor = false;
  segment = 'active';
  isLoading = false;

  myRequestSub: Subscription;

  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private modalCtrl: ModalController
  ) {

  }

  ngOnInit() {
    this.myRequestSub = this.requestService.myRequests.subscribe((requests) => {
      this.allRequests = requests;
      this.filterRequests(this.segment);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.userService.isDonorProfile
      .pipe(
        switchMap((isDonarProfile) => {
          this.isDonor = isDonarProfile;
          this.segment = this.isDonor ? 'assigned': 'active';
          return this.requestService.fetchRequests(this.isDonor);
        })
      )
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.filterRequests(event.detail.value);
  }

  filterRequests(segment: string){
    if (segment === 'active') {
      this.requests = this.findActiveRequests(this.allRequests);
    } else if (segment === 'assigned') {
      this.requests = this.allRequests.filter(
        (x) => x.requestStatus.desc === 'Processing'
      );
    } else if (segment === 'follow-up') {
      this.requests = this.allRequests.filter(
        (x) =>  x.followUpRequired &&
          (x.requestStatus.desc !== 'Processing' &&
          x.requestStatus.desc !== 'Submitted')
      );
    } else if (segment === 'history') {
      this.requests = this.allRequests.filter(
        (x) => (this.isDonor ? !x.followUpRequired : true) &&
          (x.requestStatus.desc !== 'Processing' &&
          x.requestStatus.desc !== 'Submitted')
      );
    }
  }

  findActiveRequests(requests: Request[]) {
    if (this.isDonor) {
      return requests.filter((x) => x.requestStatus.desc === 'Submitted');
    } else {
      return requests.filter(
        (x) =>
          x.requestStatus.desc === 'Submitted' ||
          x.requestStatus.desc === 'Processing'
      );
    }
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

  ngOnDestroy(){
    this.myRequestSub.unsubscribe();
  }
}
