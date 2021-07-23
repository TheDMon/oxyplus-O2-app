import { Component, OnInit } from '@angular/core';
import { DiscoverService } from './discover.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {
  distance: number = 10;

  constructor(private discoverService: DiscoverService) {}

  ngOnInit() {}

  onRangeChange() {
    console.log(this.distance);
    this.discoverService.setDistance(this.distance);
  }
}
