/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  apiBaseUrl = 'http://localhost:3000';
  userAccessKey = 'USER_ACCESS_KEY';
  private _user = new BehaviorSubject<User>(null);

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

  loadUserProfile(email: string) {
    return this.http
      .get<User[]>(`${this.apiBaseUrl}/donar/user/${email}`)
      .pipe(
        tap((users) => {
          this._user.next(users[0]);

          // remove item if present
          if (localStorage.getItem(this.userAccessKey)) {
            localStorage.removeItem(this.userAccessKey);
          }

          // add item to storage
          localStorage.setItem(this.userAccessKey, JSON.stringify(users[0]));
        })
      );
  }

  get loggedInUser() {
    return this._user.asObservable();
  }

  get isDonarProfile() {
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

  autoLogin() {
    let isUserPresent = false;
    if (localStorage.getItem(this.userAccessKey)) {
      this._user.next(JSON.parse(localStorage.getItem(this.userAccessKey)));
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

    this._user.next(null);
  }
}
