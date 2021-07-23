/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { Request } from 'src/app/models/request';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/pages/login/user.service';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  apiBaseUrl = 'http://localhost:3000';
  private _discoveredRequests = new BehaviorSubject<Request[]>([]);
  private _discoveredDonors = new BehaviorSubject<User[]>([]);
  private _distance = new BehaviorSubject<number>(10);

  constructor(private http: HttpClient, private userService: UserService) {}

  get discoveredRequests() {
    return this._discoveredRequests.asObservable();
  }

  get discoveredDonors() {
    return this._discoveredDonors.asObservable();
  }

  get distanceDiscovered() {
    return this._distance.asObservable();
  }

  setDistance(distance: number) {
    this._distance.next(distance);
  }

  findSubmittedRequests() {
    let distance: number;
    return this.distanceDiscovered.pipe(
      switchMap(dis => {
        distance = dis;
        return this.userService.loggedInUser;
      }
    ),
      //take(1),
      switchMap((user) => this.http.get<Request[]>(
          `${this.apiBaseUrl}/request/submitted/near-by/${user._id}?distance=${distance}`
        )),
      tap((requests) => {
        this._discoveredRequests.next(requests);
      })
    );
  }

  findDonors(){
    let distance: number;
    return this.distanceDiscovered.pipe(
      switchMap(dis => {
        distance = dis;
        return this.userService.loggedInUser;
      }
    ),
      //take(1),
      switchMap((user) => this.http
          .get<User[]>(`${this.apiBaseUrl}/oxyplus/donors/near-by/${user._id}?distance=${distance}`)),
      tap((donors) => {
        this._discoveredDonors.next(donors);
      })
    );
  }
}
