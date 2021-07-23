import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from 'src/app/pages/login/user.service';
import { User } from '../../models/user';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
    private fireAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient,
    private userService: UserService
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

  async onSubmit(){
    if(this.isLogin){
      this.loginWithEmail();
    } else{
      this.registerWithEmail();
    }
    this.form.reset();
  }

  async loginWithEmail() {
    if (!this.form.valid) {
      return;
    }

    const authCallObs = from(this.fireAuth.auth.signInWithEmailAndPassword(
      this.form.value.email,
      this.form.value.password
    )).pipe(
      switchMap(authData => this.userService.loadUserProfile(authData.user.email)),
      switchMap(users => this.userService.loggedInUser)
    );

    this.showProgess = true;
    authCallObs.subscribe(user => {
      if (user) {
        this.router.navigate(['/', 'discover']);
      } else {
        this.router.navigate(['/', 'profile', { type: 'new' }]);
      }
      this.showProgess = false;
    });
  }

  async registerWithEmail() {
    try {
      this.showProgess = true;
      const response = await this.fireAuth.auth.createUserWithEmailAndPassword(
        this.form.value.email,
        this.form.value.password
      );
      this.showProgess = false;

      if (response.user.email) {
        console.log('success');
      } else {
        console.log('registration failed');
      }
    } catch (error) {
      alert(error);
      this.showProgess = false;
    }
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}
