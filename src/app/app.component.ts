import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { UserService } from './pages/login/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private userService: UserService,
    private navCtrl: NavController,
    private router: Router) {}

  logout(){
    this.userService.logout();
    this.navCtrl.pop();
    this.router.navigate(['/', 'login']);
  }
}
