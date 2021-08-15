import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UserService } from '../login/user.service';
import { DiscoverService } from './discover.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  distance = 10; // default distance is 10KM
  isDonor: boolean;

  constructor(
    private discoverService: DiscoverService,
    private platform: Platform,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.isDonorProfile.subscribe(
      (isDonor) => (this.isDonor = isDonor)
    );
  }

  ionViewDidEnter() {
    this.platform.backButton.observers.pop();
  }

  onRangeChange() {
    this.discoverService.setDistance(this.distance);
  }
}
