/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject, throwError } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { RequestStatusEnum } from 'src/app/enum/request-status.enum';

import { ApiResponse } from 'src/app/models/api-response';
import { environment } from 'src/environments/environment';
import { Request, RequestStatus } from '../../models/request';
import { DiscoverService } from '../discover/discover.service';
import { UserService } from '../login/user.service';

@Injectable({ providedIn: 'root' })
export class RequestService {
  apiBaseUrl = environment.apiBaseUrl;
  private _myRequests = new BehaviorSubject<Request[]>([]);
  private _requestStatuses = new BehaviorSubject<RequestStatus[]>([]);

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private discoverService: DiscoverService,
    private loadingCtrl: LoadingController
  ) {
    this.loadRequestStatusList().subscribe();
  }

  get myRequests() {
    return this._myRequests.asObservable();
  }

  get requestStatusList() {
    return this._requestStatuses.asObservable();
  }

  loadRequestStatusList() {
    return this.http
      .get<RequestStatus[]>(`${this.apiBaseUrl}/oxyplus/list/RequestStatus`)
      .pipe(
        tap((list) => {
          this._requestStatuses.next(list);
        })
      );
  }

  createRequest(newRequest: Request) {
    this.loadingCtrl.create({
      message: 'Please wait ...'
    }).then(elem => elem.present());

    let savedRequest: Request;
    return this.userService.loggedInUser.pipe(
      take(1),
      switchMap((user) => {
        newRequest.submittedBy = user;
        return this.http.post<ApiResponse>(
          `${this.apiBaseUrl}/request/create`,
          newRequest
        );
      }),
      take(1),
      switchMap((response) => {
        if (response.ok) {
          savedRequest = { ...newRequest, _id: response.id };
          return this.myRequests;
        } else {
          throw throwError('API Error: could not save');
        }
      }),
      take(1),
      tap((requests) => {
        this._myRequests.next(requests.concat(savedRequest));
        this.loadingCtrl.dismiss();
      })
    );
  }

  updateRequest(editRequest: Request) {
    this.loadingCtrl.create({
      message: 'Please wait ...'
    }).then(elem => elem.present());

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
        updatedRequests = [...requests];
        const index = updatedRequests.findIndex(
          (x) => x._id === editRequest._id
        );
        updatedRequests.splice(index, 1, savedRequest);
        this._myRequests.next(updatedRequests);

        this.loadingCtrl.dismiss();

        // let's reload discovered requests
        if (
          editRequest.requestStatus.desc === RequestStatusEnum.Processing ||
          editRequest.requestStatus.desc === RequestStatusEnum.Submitted
        ) {
          this.discoverService
            .findSubmittedRequests()
            .pipe(take(1))
            .subscribe();
        }
      })
    );
  }

  viewRequests(status: string) {
    return this.http.get<Request[]>(
      `${this.apiBaseUrl}/request/list/${status}`
    );
  }

  fetchRequests(isDonar: boolean) {
    this.loadingCtrl.create({
      message: 'Please wait ...'
    }).then(elem => elem.present());

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
      tap((requests) => {
        this._myRequests.next(requests);
        this.loadingCtrl.dismiss();
      })
    );
  }
}
