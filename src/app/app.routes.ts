import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { LoginComponent } from './login/login';
import { Admin } from './admin/admin';
import { Cuaca } from './cuaca/cuaca';
import { Dashboard1 } from './dashboard1/dashboard1';
import { Dashboard2 } from './dashboard2/dashboard2';
import { Dashboard3 } from './dashboard3/dashboard3';
import { Mahasiswa } from './mahasiswa/mahasiswa';
import { LogoutComponent } from './logout/logout';
import { otentikasiGuard } from './otentikasi-guard';
import { Forex } from './forex/forex';
import { Saham } from './saham/saham';
import { Nasa } from './nasa/nasa';
import { Gallery } from './gallery/gallery';

export const routes: Routes = [
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {path: "admin", component: Admin},
  {path: "cuaca", component: Cuaca, canActivate: [otentikasiGuard] },
  {path: "dashboard", redirectTo: 'dashboard1', pathMatch: 'full'},
  {path: "dashboard1", component: Dashboard1, canActivate: [otentikasiGuard] },
  {path: "dashboard2", component: Dashboard2, canActivate: [otentikasiGuard] },
  {path: "dashboard3", component: Dashboard3, canActivate: [otentikasiGuard] },
  {path: "forex", component: Forex, canActivate: [otentikasiGuard] },
  {path: "saham", component: Saham, canActivate: [otentikasiGuard] },
  {path: "gallery", component: Gallery, canActivate: [otentikasiGuard] },
  {path: "logout", component: LogoutComponent},
  {path: "login", component: LoginComponent},
  {path: "nasa", component: Nasa, canActivate: [otentikasiGuard] },
  {path: "mahasiswa", component: Mahasiswa, canActivate: [otentikasiGuard] }
];
