import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AlertUtil } from '../alert-utility/alert-utility.util';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private alertUtil: AlertUtil) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
    .pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
         if (error.error instanceof ErrorEvent) {
           // client-side error
           errorMessage = `Error: ${error.error.message}`;

         } else {
           // server-side error
           errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
         }

         this.alertUtil.presentToast(errorMessage);

        // log to external system and throw back
        return throwError(errorMessage);
      })
    );
  }
}
