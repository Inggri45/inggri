import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
  imports: [RouterModule]
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'login-page');
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'login-page');
  }
}
