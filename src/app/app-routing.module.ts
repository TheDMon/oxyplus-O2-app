import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './pages/login/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'discover',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./pages/profile/profile.module').then((m) => m.ProfilePageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'request',
    loadChildren: () =>
      import('./pages/request/request.module').then((m) => m.RequestPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: 'discover',
    loadChildren: () =>
      import('./pages/discover/discover.module').then(
        (m) => m.DiscoverPageModule
      ),
    canLoad: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
