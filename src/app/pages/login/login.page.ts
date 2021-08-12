import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UserService } from 'src/app/pages/login/user.service';
import { switchMap } from 'rxjs/operators';
import { AlertUtil } from 'src/app/alert-utility/alert-utility.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  showProgess = false;
  isLogin = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private alertUtil: AlertUtil
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });
  }

  async onSubmit() {
    if (this.isLogin) {
      this.loginWithEmail();
    } else {
      this.registerWithEmail();
    }
  }

  async loginWithEmail() {
    if (!this.form.valid) {
      return;
    }

    const { email, password } = this.form.value;

    const authCallObs = this.userService
      .login(email, password)
      .pipe(
        switchMap(() => this.userService.loadUserProfile(email)),
        switchMap(() => this.userService.loggedInUser)
      );

    this.showProgess = true;
    authCallObs.subscribe(
      (user) => {
        if (user) {
          this.router.navigate(['/', 'discover']);
        } else {
          this.router.navigate(['/', 'profile', { type: 'new' , replaceUrl: true }]);
        }
        this.form.reset();
        this.showProgess = false;
      },
      (err) => {
        this.alertUtil.presentAlert('Failure', '', err.error.message);
        this.showProgess = false;
      },
      () => {
        this.showProgess = false;
      }
    );
  }

  async registerWithEmail() {
    this.showProgess = true;
    this.userService.registerAccount(this.form.value.email,
      this.form.value.password).toPromise().then(() => {
        this.alertUtil.presentToast('Registration successful! Please switch to login view to login');
        this.form.reset();
        this.showProgess = false;
      }).catch(err => {
        this.alertUtil.presentAlert('Failure', '', err.error.message);
        this.showProgess = false;
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}
