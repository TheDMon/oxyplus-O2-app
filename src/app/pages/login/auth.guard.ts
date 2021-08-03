import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { UserService } from 'src/app/pages/login/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
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
        tap((isAuthenticated) => {
          if (!isAuthenticated) {
            this.router.navigate(['/', 'login']);
          }
        })
      );
    }
  }
}
