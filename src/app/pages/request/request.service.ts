/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { ApiResponse } from 'src/app/models/api-response';
import { Request, RequestStatus } from '../../models/request';
import { DiscoverService } from '../discover/discover.service';
import { UserService } from '../login/user.service';

@Injectable({ providedIn: 'root' })
export class RequestService {
  apiBaseUrl = 'http://localhost:3000';
  private _myRequests = new BehaviorSubject<Request[]>([]);

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private discoverService: DiscoverService
  ) {}

  get myRequests() {
    return this._myRequests.asObservable();
  }

  requestStatusList() {
    return this.http.get<RequestStatus[]>(
      `${this.apiBaseUrl}/oxyplus/list/RequestStatus`
    );
  }

  createRequest(newRequest: Request) {
    let savedRequest: Request;
    return this.userService.loggedInUser.pipe(
      take(1),
      switchMap((user) => {
        console.log('Switched from loggedInUser');
        newRequest.submittedBy = user;
        return this.http.post<ApiResponse>(
          `${this.apiBaseUrl}/request/create`,
          newRequest
        );
      }),
      take(1),
      switchMap((response) => {
        console.log('Switched from API');

        if (response.ok) {
          savedRequest = { ...newRequest, _id: response.id };
          return this.myRequests;
        } else {
          throw throwError('API Error: could not save');
        }
      }),
      take(1),
      tap((requests) => {
        console.log('Switched from BehaviborSubject Call');

        this._myRequests.next(requests.concat(savedRequest));
      })
    );
  }

  updateRequest(editRequest: Request) {
    let updatedRequests: Request[];
    let savedRequest: Request;
    return this.userService.loggedInUser.pipe(
      take(1),
      switchMap((user) => {
        editRequest.updatedBy = user;
        return this.http.post<ApiResponse>(
          `${this.apiBaseUrl}/request/update`,
          editRequest
        );
      }),
      take(1),
      switchMap((response) => {
        if (response.ok) {
          savedRequest = { ...editRequest };
          return this.myRequests;
        } else {
          throw throwError('API Error: could not update');
        }
      }),
      take(1),
      tap((requests) => {
        console.log('Switched from BehaviborSubject Call');
        updatedRequests = [...requests];
        const index = updatedRequests.findIndex(
          (x) => x._id === editRequest._id
        );
        updatedRequests.splice(index, 1, savedRequest);
        this._myRequests.next(updatedRequests);

        // let's reload discovered requests
        if(editRequest.requestStatus.desc === 'Processing' || editRequest.requestStatus.desc === 'Submitted'){
          this.discoverService.findSubmittedRequests().pipe(take(1)).subscribe();
        }

      })
    );
  }

  // findActiveRequests(userId: string) {
  //   return this.http.get<Request[]>(
  //     `http://localhost:3000/request/active/${userId}`
  //   );
  // }

  viewRequests(status: string) {
    return this.http.get<Request[]>(
      `${this.apiBaseUrl}/request/list/${status}`
    );
  }

  fetchRequests(isDonar: boolean) {
    return this.userService.loggedInUser.pipe(
      take(1),
      switchMap((user) => {
        if (isDonar) {
          return this.http.get<Request[]>(
            `${this.apiBaseUrl}/request/assigned-to-me/${user._id}`
          );
        } else {
          return this.http.get<Request[]>(
            `${this.apiBaseUrl}/request/submitted-by-me/${user._id}`
          );
        }
      }),
      tap((requests) => this._myRequests.next(requests))
    );
  }
}
