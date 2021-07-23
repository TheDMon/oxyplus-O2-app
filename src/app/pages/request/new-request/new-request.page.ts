import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { switchMap, take } from 'rxjs/operators';

import { Address } from 'src/app/models/address';
import { Request } from 'src/app/models/request';
import { RequestService } from 'src/app/pages/request/request.service';
import { UserService } from 'src/app/pages/login/user.service';
import { AlertUtil } from 'src/app/alert-utility/alert-utility.util';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.page.html',
  styleUrls: ['./new-request.page.scss'],
})
export class NewRequestPage implements OnInit {
  form: FormGroup;
  location: Address;

  constructor(
    private requestService: RequestService,
    private navCtrl: NavController,
    private userService: UserService,
    private alertUtil: AlertUtil
  ) {}

  ngOnInit() {
    this.userService.loggedInUser.pipe(take(1)).subscribe((user) => {
      this.location = user.address;

      this.form = new FormGroup({
        requester: new FormControl(user.name, {
          updateOn: 'blur',
          validators: [Validators.required],
        }),
        location: new FormControl(user.address, {
          updateOn: 'blur',
          validators: [Validators.required],
        }),
        contact: new FormControl(user.mobile, {
          updateOn: 'blur',
          validators: [Validators.required],
        }),
      });
    });
  }

  onLocationChange(addr: Address) {
    this.form.value.location = addr;
  }

  addRequest() {
    if(!this.form.value){
      return;
    }

    this.requestService
      .requestStatusList()
      .pipe(
        take(1),
        switchMap((statusList) => {
          const newRequest = new Request();
          newRequest.requester = this.form.value.requester;
          newRequest.location = this.form.value.location;
          newRequest.contact = this.form.value.contact;
          newRequest.requestStatus = statusList.find(
            (x) => x.desc === 'Submitted'
          );

          return this.requestService.createRequest(newRequest);
        })
      )
      .subscribe(() => {
        this.alertUtil.presentToast('Request has been submitted!');
        this.form.reset();
        this.navCtrl.pop();
      });
  }
}
