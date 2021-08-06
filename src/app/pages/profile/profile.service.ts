/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Role } from '../../models/role';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiBaseUrl: string;
  private _roles = new BehaviorSubject<Role[]>(null);

  constructor(private http: HttpClient) {
    this.apiBaseUrl = environment.apiBaseUrl;
  }

  get profileRoles() {
    return this._roles.asObservable();
  }

  loadRoles() {
    return this.http
      .get<Role[]>(`${this.apiBaseUrl}/oxyplus/list/Role`)
      .pipe(tap(roles => {
        this._roles.next(roles);
      }));
  }
}
