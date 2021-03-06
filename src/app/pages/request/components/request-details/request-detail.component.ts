import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertUtil } from 'src/app/alert-utility/alert-utility.util';

import { User } from 'src/app/models/user';
import { RequestService } from 'src/app/pages/request/request.service';
import { UserService } from 'src/app/pages/login/user.service';
import { Request, RequestStatus } from '../../../../models/request';
import { environment } from '../../../../../environments/environment';
import { RequestStatusEnum } from '../../../../enum/request-status.enum';
import { Coordinate } from 'src/app/models/location';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss'],
})
export class RequestDetailComponent implements OnInit {
  @Input() request: Request;
  statusList: RequestStatus[];
  user: User;
  mapImgUrl: string;

  constructor(
    private alertUtil: AlertUtil,
    private requestService: RequestService,
    private userService: UserService,
    private modalCtrl: ModalController
  ) {}

  get isDonar() {
    return this.userService.isDonorProfile;
  }

  ngOnInit() {
    this.requestService.requestStatusList.subscribe(
      (result) => (this.statusList = result)
    );

    this.userService.loggedInUser.subscribe((user) => (this.user = user));
  }

  onUpdate() {
    const header = 'Change Status';
    const buttons = [];

    if (this.request.requestStatus.desc === RequestStatusEnum.Submitted) {
      buttons.push({
        text: 'Assign',
        handler: () => {
          this.request.assignedTo = this.user;
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Processing)
          );
        },
      });
    }

    if (this.request.requestStatus.desc === RequestStatusEnum.Processing) {
      buttons.push({
        text: 'Send back to Submitted',
        handler: () => {
          this.request.assignedTo = null;
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Submitted)
          );
        },
      });

      buttons.push({
        text: 'Resolved',
        handler: () => {
          this.request.followUpRequired = true;
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Resolved)
          );
        },
      });

      buttons.push({
        text: 'Rejected',
        handler: () => {
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Rejected)
          );
        },
      });
    }

    if (
      this.request.requestStatus.desc === RequestStatusEnum.Resolved &&
      this.request.followUpRequired
    ) {
      buttons.push({
        text: 'Done',
        handler: () => {
          this.request.followUpRequired = false;
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Resolved)
          );
        },
      });
    }

    buttons.push({
      text: 'Cancel',
      role: 'cancel',
    });

    this.alertUtil.presentActionSheet(header, buttons);
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

  updateRequest(status: RequestStatus) {
    const editRequest = { ...this.request };
    editRequest.requestStatus = status;
    editRequest.updatedOn = new Date();
    this.requestService.updateRequest(editRequest).subscribe(() => {
      this.request = editRequest;
      this.alertUtil.presentToast('Status updated');
    });
  }

  onCancel() {
    this.alertUtil
      .presentConfirm('Confirm', '', 'Are you sure to cancel the request?')
      .then((dialogResult) => {
        if (dialogResult) {
          this.updateRequest(
            this.statusList.find((x) => x.desc === RequestStatusEnum.Cancelled)
          );
        }
      });
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

  private getMapImage(lat: number, lng: number, zoom: number) {
    console.log(lat, lng);
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}
