/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Storage } from '@capacitor/storage';

import { ApiResponse } from 'src/app/models/api-response';
import { SubscriptionDetails } from 'src/app/models/subscription-details';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user';

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

  constructor(private http: HttpClient) {}

  get isAuthenticated() {
    return this._accessToken
      .asObservable()
      .pipe(map((accessToken) => !!accessToken));
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
    return this.http.post(`${this.apiBaseUrl}/auth/register`, {
      email,
      password,
    });
  }

  login(email: string, password: string) {
    return this.http
      .post(`${this.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
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
        })
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
    return this.http
      .post<ApiResponse>(`${this.apiBaseUrl}/oxyplus/profile/create`, user)
      .pipe(
        take(1),
        tap((res) => {
          if (res.ok) {
            return this.loadUserProfile(user.email);
          } else {
            throw throwError('Some error has occurred');
          }
        })
      );
  }

  updateUserProfile(user: User) {
    return this.http
      .post<ApiResponse>(`${this.apiBaseUrl}/oxyplus/profile/update`, user)
      .pipe(
        take(1),
        tap((res) => {
          if (res.ok) {
            return this.loadUserProfile(user.email);
          } else {
            throw throwError('Some error has occurred');
          }
        })
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
        return this.loadUserProfile(userData.email);;
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
    return this.loggedInUser.pipe(
      take(1),
      switchMap((user) => {
        user.subscriptionDetails = subscriptionDetails;
        return this.updateUserProfile(user);
      })
    );
  }
}
