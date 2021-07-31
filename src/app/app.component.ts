/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserService } from './pages/login/user.service';
import { SwPush } from '@angular/service-worker';
import { SubscriptionDetails } from './models/subscription-details';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private router: Router,
    private swPush: SwPush
  ) {}

  VAPID_PUBLIC_KEY =
    'BHDNHLflG0CSxnKyC71y-9ZhJSn4Gfht1WSpvFLFtnIJ9BTdcSQ7e2F_wT1Dx3EW0MqhUdhoylcSJ69VGFMizmc';

  logout() {
    this.userService.logout();
    this.navCtrl.pop();
    this.router.navigate(['/', 'login']);

  }

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((sub) => {
        const subscriptionDetails: SubscriptionDetails = {
          distance: 10,
          subscription: sub,
        };

        this.userService
          .updateSubscriptionDetails(subscriptionDetails)
          .pipe(take(1))
          .subscribe();
      })
      .catch((err) =>
        console.error('Could not subscribe to notifications', err)
      );
  }
}
