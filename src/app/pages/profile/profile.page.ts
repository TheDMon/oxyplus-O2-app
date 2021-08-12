/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { UserService } from '../../pages/login/user.service';
import { GoogleAutocompleteComponent } from '../../shared/components/google-autocomplete/google-autocomplete.component';
import { AlertUtil } from '../../alert-utility/alert-utility.util';
import { Role } from '../../models/role';
import { User } from '../../models/user';
import { ProfileService } from './profile.service';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  user: User;
  showProgess = false;
  isNewProfile = false;
  isDonor = false;
  selectedRoleID: string;
  subscriptions: Subscription[] = [];

  roles: Role[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertUtil: AlertUtil,
    private userService: UserService,
    private profileService: ProfileService,
    private modalCtrl: ModalController
  ) {
    this.route.params.forEach((param) => {
      if (param.type) {
        this.isNewProfile =
          param.type.trim().toLowerCase() === 'new' ? true : false;
      }
    });
  }

  ngOnInit() {
    this.loadProfileRoles();
    this.subscriptions.push(
      this.userService.loggedInUser
        .pipe(
          switchMap((user) => {
            if (user) {
              this.user = user;
            } else {
              this.user = new User();
              this.user.email = this.userService.userEmail;
              this.user.location = new Location();
            }
            return this.userService.isDonorProfile;
          }),
          switchMap((isDonor) => {
            this.isDonor = isDonor;
            return this.profileService.profileRoles;
          })
        )
        .subscribe((roles) => (this.roles = roles))
    );

    if (this.user.role !== undefined) {
      this.selectedRoleID = this.user.role._id;
    }
  }

  loadProfileRoles() {
    this.subscriptions.push(
      this.profileService
        .loadRoles()
        .pipe(take(1))
        .subscribe((roles) => (this.roles = roles))
    );
  }

  profileChosen() {
    const selectedRole = this.roles.find((x) => x._id === this.selectedRoleID);
    this.user.role = selectedRole;
    if (
      selectedRole.name !== 'Recipient'
    ) {
      this.isDonor = true;
    } else {
      this.isDonor = false;
    }
  }

  openLocationPicker() {
    const placeChosenEvent = new EventEmitter();
    this.modalCtrl
      .create({
        component: GoogleAutocompleteComponent,
        componentProps: {
          placeChosen: placeChosenEvent,
        },
      })
      .then((element) => {
        element.present();
      });

    this.subscriptions.push(
      placeChosenEvent.subscribe((loc) => {
        this.user.location = loc;
      })
    );
  }

  createProfile() {
    if(!this.isFormValid()){
      this.alertUtil.presentAlert('Information missing', '' , 'Please enter required information');
      return;
    }

    this.showProgess = true;

    this.userService.createUserProfile(this.user).subscribe({
      complete: () => {
        this.alertUtil.presentAlert(
          'Profile',
          '',
          'Profile created successfully!'
        ).then(() => {
          this.router.navigate(['/discover', { replaceUrl: true }]);
        });

        this.showProgess = false;
      },
      error: (error) => {
        this.alertUtil.presentAlert(
          'Error',
          'An error occurred',
          `Error details: ${error}`
        );

        this.showProgess = false;
      },
    });
  }

  updateProfile() {
    if(!this.isFormValid()){
      this.alertUtil.presentAlert('Information missing', '' , 'Please enter required information');
      return;
    }

    this.showProgess = true;

    this.userService.updateUserProfile(this.user).subscribe({
      complete: () => {
        this.alertUtil.presentAlert(
          'Profile',
          '',
          'Profile updated successfully'
        );

        this.showProgess = false;
      },
      error: (error) => {
        this.alertUtil.presentAlert(
          'Error',
          'An error occurred',
          `Error details: ${error}`
        );

        this.showProgess = false;
      },
    });
  }

  isFormValid(){
    console.log(this.user);
    if(this.user.email && this.user.mobile && this.user.location && this.user.role){
      return this.isDonor ? this.user.quantity > -1 : true;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
