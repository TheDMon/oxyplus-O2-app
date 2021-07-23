import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertUtil } from 'src/app/alert-utility/alert-utility.util';

import { User } from 'src/app/models/user';
import { RequestService } from 'src/app/pages/request/request.service';
import { UserService } from 'src/app/pages/login/user.service';
import { Request, RequestStatus } from '../../../../models/request';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
})
export class RequestDetailComponent implements OnInit {
  @Input() request: Request;
  statusList: RequestStatus[];
  user: User;

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
    this.requestService
      .requestStatusList()
      .subscribe((result) => (this.statusList = result));

    this.userService.loggedInUser.subscribe((user) => (this.user = user));
  }

  onUpdate() {
    const header = 'Change Status';
    const buttons = [];

    if (this.request.requestStatus.desc === 'Submitted') {
      buttons.push({
        text: 'Assign',
        handler: () => {
          // eslint-disable-next-line no-underscore-dangle
          this.request.assignedTo = this.user._id;
          this.updateRequest(
            this.statusList.find((x) => x.desc === 'Processing')
          );
        },
      });
    }

    if (this.request.requestStatus.desc === 'Processing') {
      buttons.push({
        text: 'Send back to Submitted',
        handler: () => {
          this.request.assignedTo = null;
          this.updateRequest(
            this.statusList.find((x) => x.desc === 'Submitted')
          );
        },
      });

      buttons.push({
        text: 'Resolved',
        handler: () => {
          this.request.followUpRequired = true;
          this.updateRequest(
            this.statusList.find((x) => x.desc === 'Resolved')
          );
        },
      });

      buttons.push({
        text: 'Rejected',
        handler: () => {
          this.updateRequest(
            this.statusList.find((x) => x.desc === 'Rejected')
          );
        },
      });
    }

    if (
      this.request.requestStatus.desc === 'Resolved' &&
      this.request.followUpRequired
    ) {
      buttons.push({
        text: 'Done',
        handler: () => {
          this.request.followUpRequired = false;
          this.updateRequest(
            this.statusList.find((x) => x.desc === 'Resolved')
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
    this.requestService.updateRequest(editRequest).subscribe(() => {
      this.request = editRequest;
      this.alertUtil.presentToast('Status updated');
    });
  }

  onCancel() {
    this.updateRequest(this.statusList.find((x) => x.desc === 'Cancelled'));
  }
}
