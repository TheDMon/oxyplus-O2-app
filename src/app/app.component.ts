/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserService } from './pages/login/user.service';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { SubscriptionDetails } from './models/subscription-details';
import { map, switchMap, take } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';

import { environment } from '../environments/environment';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';
import { AlertUtil } from './alert-utility/alert-utility.util';
import { from, interval, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private router: Router,
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private alertUtil: AlertUtil
  ) {
    // code to subscribe to update available event
    this.swUpdate.available.subscribe((event) => {
      if (event.available) {
        this.alertUtil
          .presentConfirm(
            'Updates available!',
            '',
            'Reload the app to install?'
          )
          .then((result) => {
            if(result){
              document.location.reload();
            }
          });
      }
    });
  }

  initPushNotifications() {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  ngOnInit() {
    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');

    if (isPushNotificationsAvailable) {
      console.log('Enabling push notification...');
      this.initPushNotifications();
    }

    // if (this.swPush.isEnabled) {
    //   this.swPush.notificationClicks.subscribe(({ action, notification }) => {
    //     // TODO: Do something in response to notification click.
    //     window.focus();
    //     window.open(
    //       notification.data.url || 'https://oxyplus.mybluemix.net',
    //       '_self'
    //     );
    //   });
    // }
  }

  logout() {
    this.userService.logout();
    this.navCtrl.pop();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get hasPushNotificaitonSubscription() {
    return this.swPush.isEnabled
      ? this.userService.hasSubscribedToNotification
      : of(false);
  }

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: environment.publicVapidKey,
      })
      .then((sub) => {
        const subscriptionDetails: SubscriptionDetails = {
          distance: 50,
          subscription: sub,
        };

        this.userService
          .updateSubscriptionDetails(subscriptionDetails)
          .pipe(take(1))
          .subscribe(() => {
            this.alertUtil.presentToast(
              'Successfully subscribed to notification!'
            );
          });
      })
      .catch((err) =>
        console.error('Could not subscribe to notifications', err)
      );
  }

  unsubscribeFromNotifications() {
    this.userService
      .updateSubscriptionDetails(null)
      .pipe(take(1))
      .subscribe(() => {
        this.alertUtil.presentToast(
          'Successfully unsubscribed from notifications!'
        );
      });
  }
}
