import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, Renderer2 } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { encryptUserId, AUTH_COOKIE_USER_ID } from '../auth-crypto';

declare const $: any;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [RouterModule]
})

export class LoginComponent implements OnDestroy {

  constructor(private renderer: Renderer2, private httpClient: HttpClient,
              private router: Router, private cookieService: CookieService
  ) {

    this.renderer.addClass(document.body, "login-page");

    this.renderer.removeClass(document.body, "sidebar-mini");
    this.renderer.removeClass(document.body, "layout-fixed");

    this.renderer.setAttribute(document.body, "style", "min-height: 464px;");
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'login-page');
    this.renderer.removeAttribute(document.body, 'style');
  }

  showPeringatanModal(message: string): void {
    $("#peringatanModal").modal();
    $("#pm_message").html(message);
  }

  signIn(): void {

    console.log('signIn()');

    const userIdRaw = String($('#idText').val() || '');
    const passwordRaw = String($('#passwordText').val() || '');
    const userId = encodeURIComponent(userIdRaw);
    const password = encodeURIComponent(passwordRaw);

    const url = 'https://stmikpontianak.cloud/011100862/login.php' +
                '?id=' + userId +
                '&password=' + password;

    console.log("url : " + url);

    this.httpClient.get(url).subscribe((data: any) => {

      console.log(data);
      var row = data[0];

      if (row.idCount != "1") {
        this.showPeringatanModal("Id atau password tidak cocok");
        return;
      }

      // Enkripsi userId dengan kunci yang konsisten
      const encryptedUserId = encryptUserId(userIdRaw);

      // Simpan cookie terenkripsi
      this.cookieService.set(AUTH_COOKIE_USER_ID, encryptedUserId);

      console.log("session data berhasil dibuat");

      this.renderer.removeClass(document.body, 'login-page');
      this.renderer.removeAttribute(document.body, 'style');
      this.router.navigate(["/dashboard1"]);


    });

  }

}
