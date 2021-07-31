import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from 'src/app/models/location';
import { UserService } from 'src/app/pages/login/user.service';
import { AlertUtil } from '../../alert-utility/alert-utility.util';
import { Role } from '../../models/role';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User;
  showProgess = false;
  isNewProfile = false;
  isDonor = false;
  selectedRoleID: string;

  roles: Role[];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertUtil: AlertUtil,
    private userService: UserService
  ) {
    this.route.params.forEach((param) => {
      if (param.type) {
        this.isNewProfile =
          param.type.trim().toLowerCase() === 'new' ? true : false;
      }
    });
  }

  ngOnInit() {
    this.getRoles();
    this.userService.loggedInUser.subscribe((user) => {
      if(user){
        this.user = user;
      } else {
        this.user = new User();
      }
    });
    if (this.user.role !== undefined) {
      // eslint-disable-next-line no-underscore-dangle
      this.selectedRoleID = this.user.role._id;
    }
    console.log('profile page', this.user);
  }

  onLocationChange(location: Location) {
    this.user.location = location;
  }

  getRoles() {
    this.http.get<Role[]>(`http://localhost:3000/oxyplus/list/Role`).subscribe(
      (data) => (this.roles = data),
      (err) => console.log(err),
      () => {
        console.log(this.roles);
        this.checkIfDonor();
      }
    );
  }

  checkIfDonor() {
    this.userService.isDonorProfile.subscribe(isDonor => this.isDonor = isDonor);
  }

  createProfile() {
    console.log('user', this.user);
    this.showProgess = true;

    this.userService.createUserProfile(this.user).subscribe({
      complete: () => {
        this.alertUtil.presentAlert(
          'Profile',
          '',
          'Profile created successfully'
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
      }
    });
  }

  updateProfile() {
    console.log('user', this.user);
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
      }
    });
  }
}
