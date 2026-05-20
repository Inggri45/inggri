import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { LoginComponent } from './login/login';
import { Admin } from './admin/admin';
import { Dashboard1 } from './dashboard1/dashboard1';
import { Dashboard2 } from './dashboard2/dashboard2';
import { Dashboard3 } from './dashboard3/dashboard3';
import { Mahasiswa } from './mahasiswa/mahasiswa';


export const routes: Routes = [
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {path: "admin", component: Admin},
  {path: "dashboard", redirectTo: 'dashboard1', pathMatch: 'full'},
  {path: "dashboard1", component: Dashboard1},
  {path: "dashboard2", component: Dashboard2},
  {path: "dashboard3", component: Dashboard3},
  {path: "login", component: LoginComponent},
  {path: "mahasiswa", component: Mahasiswa}
];
