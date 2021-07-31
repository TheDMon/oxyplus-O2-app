/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { ApiResponse } from 'src/app/models/api-response';
import { SubscriptionDetails } from 'src/app/models/subscription-details';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  apiBaseUrl = environment.apiBaseUrl;
  userAccessKey = 'USER_ACCESS_KEY';
  private _user = new BehaviorSubject<User>(null);
  private _userProfileCompleted = false;

  constructor(private http: HttpClient) {}

  get isAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      })
    );
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

  loadUserProfile(email: string) {
    return this.http
      .get<User[]>(`${this.apiBaseUrl}/oxyplus/user/${email}`)
      .pipe(
        tap((users) => {
          if (users) {
            this._userProfileCompleted = true;
            this._user.next(users[0]);

            // remove item if present
            if (localStorage.getItem(this.userAccessKey)) {
              localStorage.removeItem(this.userAccessKey);
            }

            // add item to storage
            localStorage.setItem(this.userAccessKey, JSON.stringify(users[0]));
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
    let isUserPresent = false;
    const storedUser = localStorage.getItem(this.userAccessKey);
    if (storedUser && storedUser !== 'undefined') {
      this._user.next(JSON.parse(storedUser));
      isUserPresent = true;
    } else {
      isUserPresent = false;
    }

    return of(isUserPresent);
  }

  logout() {
    // remove item if present
    if (localStorage.getItem(this.userAccessKey)) {
      localStorage.removeItem(this.userAccessKey);
    }

    console.log(localStorage.getItem(this.userAccessKey));

    this._userProfileCompleted = false;
    this._user.next(null);
  }

  updateSubscriptionDetails(subscriptionDetails: SubscriptionDetails) {
    return this.loggedInUser.pipe(take(1),
      switchMap(user => {
        user.subscriptionDetails = subscriptionDetails;
        return this.updateUserProfile(user);
      })
    );
  }
}
