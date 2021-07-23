import { Component, OnInit } from '@angular/core';
import { UserService } from '../login/user.service';
import { DiscoverService } from './discover.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  distance = 10;
  isDonor: boolean;

  constructor(private discoverService: DiscoverService, private userService: UserService) {}

  ngOnInit() {
    this.userService.isDonorProfile.subscribe(isDonor => this.isDonor = isDonor);
  }

  onRangeChange() {
    this.discoverService.setDistance(this.distance);
  }
}
