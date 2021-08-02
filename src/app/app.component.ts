/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserService } from './pages/login/user.service';
import { SwPush } from '@angular/service-worker';
import { SubscriptionDetails } from './models/subscription-details';
import { take } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';

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
    private swPush: SwPush
  ) {}

  VAPID_PUBLIC_KEY =
    'BHDNHLflG0CSxnKyC71y-9ZhJSn4Gfht1WSpvFLFtnIJ9BTdcSQ7e2F_wT1Dx3EW0MqhUdhoylcSJ69VGFMizmc';

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
      alert('Push registration success, token: ' + token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  ngOnInit() {
    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');

    if (isPushNotificationsAvailable) {
      console.log('Enabling push notification...')
      this.initPushNotifications();
    }
  }

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
