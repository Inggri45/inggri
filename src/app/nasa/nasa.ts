import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-nasa',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    Sidebar,
    Footer
  ],
  templateUrl: './nasa.html',
  styleUrls: ['./nasa.css']
})
export class Nasa implements OnInit {
  nasaData: any;
  loading: boolean = true;
  constructor(
    private http: HttpClient,
    private renderer: Renderer2
  ) {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapsed');
  }
  ngOnInit(): void {
    this.getNasaData();
  }
  getNasaData(): void {
    this.http.get<any>(
      'https://api.nasa.gov/planetary/apod?api_key=x19aFQRNz0iRQwh8HLj7UI5i9SNfZrmNn1bhumol'
    )
    .subscribe({
      next: (response) => {
        this.nasaData = response;
        this.loading = false;
        console.log(response);
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }
}
