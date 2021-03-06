/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of, throwError } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Storage } from '@capacitor/storage';

import { ApiResponse } from 'src/app/models/api-response';
import { SubscriptionDetails } from 'src/app/models/subscription-details';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user';
import { LoadingController } from '@ionic/angular';

interface UserData {
  email: string;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  apiBaseUrl = environment.apiBaseUrl;
  userAccessKey = 'USER_ACCESS_KEY';
  private _user = new BehaviorSubject<User>(null);
  private _userProfileCompleted = false;
  private _accessToken = new BehaviorSubject<string>(null);
  private _userEmail: string;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController
  ) {}

  get isAuthenticated() {
    return this._accessToken
      .asObservable()
      .pipe(map((accessToken) => !!accessToken));
  }

  get userAccessToken() {
    return this._accessToken.asObservable();
  }

  get hasSubscribedToNotification() {
    return this.loggedInUser.pipe(
      map((user) => {
        if (user) {
          return !!user.subscriptionDetails;
        } else {
          of(false);
        }
      })
    );
  }

  get userEmail() {
    return this._userEmail;
  }

  get isProfileComplete() {
    return this._userProfileCompleted;
  }

  get loggedInUser() {
    return this._user.asObservable();
  }

  get isDonorProfile() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.role.name !== 'Recipient';
        } else {
          return false;
        }
      })
    );
  }

  registerAccount(email: string, password: string) {
    return from(
      this.loadingCtrl.create({
        message: 'Please wait ...',
      })
    ).pipe(
      switchMap((elem) => {
        elem.present();
        return this.http.post(`${this.apiBaseUrl}/auth/register`, {
          email,
          password,
        });
      }),
      tap(() => {
        this.loadingCtrl.dismiss();
      }),
      catchError((error) => {
        this.loadingCtrl.dismiss();
        throw error;
      })
    );
  }

  login(email: string, password: string) {
    this._userEmail = email;

    return from(
      this.loadingCtrl.create({
        message: 'Please wait ...',
      })
    ).pipe(
      switchMap((elem) => {
        elem.present();
        return this.http.post(`${this.apiBaseUrl}/auth/login`, {
          email,
          password,
        });
      }),
      tap((authResponse: any) => {
        const userData: UserData = {
          email,
          accessToken: authResponse.accessToken,
        };

        this._accessToken.next(authResponse.accessToken);
        // store in device
        Storage.set({
          key: this.userAccessKey,
          value: JSON.stringify(userData),
        });
      }),
      catchError((error) => {
        throw error;
      }),
      finalize(() => this.loadingCtrl.dismiss())
    );
  }

  loadUserProfile(email: string) {
    return this.http
      .get<User[]>(`${this.apiBaseUrl}/oxyplus/user/${email}`)
      .pipe(
        tap((users) => {
          if (users) {
            this._userProfileCompleted = true;
            this._user.next(users[0]);
          } else {
            this._userProfileCompleted = false;
          }
        })
      );
  }

  createUserProfile(user: User) {
    return from(
      this.loadingCtrl.create({
        message: 'Please wait ...',
      })
    ).pipe(
      switchMap((elem) => {
        elem.present();
        return this.http.post<ApiResponse>(
          `${this.apiBaseUrl}/oxyplus/profile/create`,
          user
        );
      }),
      take(1),
      tap((res) => {
        if (res.ok) {
          this.loadingCtrl.dismiss();
          return this.loadUserProfile(user.email);
        } else {
          throw throwError('Some error has occurred');
        }
      }),
      catchError((error) => {
        this.loadingCtrl.dismiss();
        throw error;
      })
    );
  }

  updateUserProfile(user: User) {
    return from(
      this.loadingCtrl.create({
        message: 'Please wait ...',
      })
    ).pipe(
      switchMap((elem) => {
        elem.present();
        return this.http.post<ApiResponse>(
          `${this.apiBaseUrl}/oxyplus/profile/update`,
          user
        );
      }),
      take(1),
      map((res) => {
        if (res.ok) {
          return this.loadUserProfile(user.email);
        } else {
          throw throwError('Some error has occurred');
        }
      }),
      catchError((error) => {
        throw error;
      }),
      finalize(() => this.loadingCtrl.dismiss())
    );
  }

  autoLogin() {
    return from(Storage.get({ key: this.userAccessKey })).pipe(
      switchMap((storedData) => {
        if (!storedData || !storedData.value) {
          return of(null);
        }

        const userData = JSON.parse(storedData.value) as UserData;
        this._accessToken.next(userData.accessToken);
        return this.loadUserProfile(userData.email);
      }),
      map((users) => users && users.length > 0)
    );
  }

  logout() {
    // remove item from storage
    Storage.remove({ key: this.userAccessKey });

    this._accessToken.next(null);
    this._userProfileCompleted = false;
  }

  updateSubscriptionDetails(subscriptionDetails: SubscriptionDetails) {
    return from(
      this.loadingCtrl.create({
        message: 'Please wait ...',
      })
    ).pipe(
      switchMap((elem) => {
        elem.present();
        return this.loggedInUser;
      }),
      take(1),
      switchMap((user) => {
        user.subscriptionDetails = subscriptionDetails;
        return this.updateUserProfile(user);
      }),
      finalize(() => this.loadingCtrl.dismiss())
    );
  }
}
