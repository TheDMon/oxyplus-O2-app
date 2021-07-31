import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { switchMap, take } from 'rxjs/operators';

import { Location } from '../../../models/location';
import { Request } from '../../../models/request';
import { RequestService } from '../../../pages/request/request.service';
import { UserService } from '../../../pages/login/user.service';
import { AlertUtil } from '../../../alert-utility/alert-utility.util';
import { User } from '../../../models/user';
import { RequestStatusEnum } from 'src/app/enum/request-status.enum';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.page.html',
  styleUrls: ['./new-request.page.scss'],
})
export class NewRequestPage implements OnInit {
  form: FormGroup;
  location: Location;
  currentUser: User;
  request: User;

  constructor(
    private requestService: RequestService,
    private navCtrl: NavController,
    private userService: UserService,
    private alertUtil: AlertUtil
  ) {}

  ngOnInit() {
    this.userService.loggedInUser.pipe(take(1)).subscribe((user) => {
      this.currentUser = user;
      this.location = user.location;

      this.form = new FormGroup({
        requester: new FormControl(user.name, {
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

  onLocationChange(location: Location) {
    this.location = location;
  }

  onBehalfChanged(event: any){
    if(event.detail.checked){
      console.log('setting null since value is : ', event.detail.checked);
      this.form.get('requester').setValue(null);
      this.form.get('contact').setValue(null);
      this.location = new Location();
    } else{
      console.log('setting user values since value is : ', event.detail.checked);
      this.form.get('requester').setValue(this.currentUser.name);
      this.form.get('contact').setValue( this.currentUser.mobile);
      this.location = this.currentUser.location;
    }
  }

  addRequest() {
    if(!this.form.valid || !this.location.position){
      return;
    }

    this.requestService
      .requestStatusList()
      .pipe(
        take(1),
        switchMap((statusList) => {
          const newRequest = new Request();
          newRequest.requester = this.form.value.requester;
          newRequest.location = this.location;
          newRequest.contact = this.form.value.contact;
          newRequest.requestStatus = statusList.find(
            (x) => x.desc === RequestStatusEnum.Submitted
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
