import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.html',
  styleUrls: ['./logout.css']
})
export class LogoutComponent {
  constructor(private cookieService: CookieService, private router: Router) {}

  ngOnInit(): void {
    // Hapus cookie atau token autentikasi
    this.cookieService.deleteAll();

    // Arahkan ke halaman login
    this.router.navigate(['/login']);
  }
}
