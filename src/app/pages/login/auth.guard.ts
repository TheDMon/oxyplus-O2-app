import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { UserService } from 'src/app/pages/login/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    if(this.userService.isProfileComplete){
      return true;
    } else {
      return this.userService.isAuthenticated.pipe(
        take(1),
        switchMap((isAuthenticated) => {
          if (!isAuthenticated) {
            return this.userService.autoLogin();
          } else {
            return of(isAuthenticated);
          }
        }),
        map((isAuthenticated) => {
          if (isAuthenticated) {
            this.router.navigate(['/', 'discover']);
            return false;
          } else {
            return true;
          }
        })
      );
    }
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
      if(this.userService.isProfileComplete){
        return true;
      } else {
        return this.userService.isAuthenticated.pipe(
          take(1),
          switchMap((isAuthenticated) => {
            if (!isAuthenticated) {
              return this.userService.autoLogin();
            } else {
              return of(isAuthenticated);
            }
          }),
          tap((isAuthenticated) => {
            if (!isAuthenticated) {
              this.router.navigate(['/', 'login']);
            }
          })
        );
      }
    }
}
