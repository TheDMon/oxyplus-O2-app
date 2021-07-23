import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Address } from 'src/app/models/address';
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
  isDonar = false;
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
    this.userService.loggedInUser.subscribe((user) => (this.user = user));
    if (this.user.role !== undefined) {
      // eslint-disable-next-line no-underscore-dangle
      this.selectedRoleID = this.user.role._id;
    }
    console.log('profile page', this.user);
  }

  onLocationChange(address: Address) {
    this.user.address = address;
  }

  getRoles() {
    this.http.get<Role[]>(`http://localhost:3000/donar/list/Role`).subscribe(
      (data) => (this.roles = data),
      (err) => console.log(err),
      () => {
        console.log(this.roles);
        this.checkIfDonar();
      }
    );
  }

  checkIfDonar() {
    console.log(this.selectedRoleID);
    // eslint-disable-next-line no-underscore-dangle
    const selectedRole = this.roles.find((x) => x._id === this.selectedRoleID);
    this.user.role = selectedRole;
    if (selectedRole && selectedRole.name !== 'Recipient') {
      this.isDonar = true;
    }
  }

  async createProfile() {
    console.log('user', this.user);
    this.showProgess = true;
    const self = this;
    await this.http
      .post<User>(`http://localhost:3000/donar/create`, this.user)
      .toPromise()
      .then((data) => {
        console.log('Profile created successfully');
        this.alertUtil.presentAlert(
          'Profile',
          '',
          'Profile created successfully'
        );
        this.userService.loadUserProfile(this.user.email);
      })
      .catch((err) => {
        console.log(`error occurred: ${err}`);
        this.alertUtil.presentAlert(
          'Error',
          'An error occurred',
          `Error details ${err}`
        );
      });
    this.showProgess = false;
  }

  async updateProfile() {
    console.log('user', this.user);
    this.showProgess = true;
    const self = this;
    await this.http
      .post<User>(`http://localhost:3000/donar/update`, this.user)
      .toPromise()
      .then((data) => {
        console.log('Profile updated successfully');
        this.alertUtil.presentAlert(
          'Profile',
          '',
          'Profile updated successfully'
        );
        this.userService.loadUserProfile(this.user.email);
        this.showProgess = false;
      })
      .catch((err) => {
        console.log(`error occurred: ${err}`);
        this.alertUtil.presentAlert(
          'Error',
          'An error occurred',
          `Error details ${err}`
        );
        this.showProgess = false;
      });
  }
}
