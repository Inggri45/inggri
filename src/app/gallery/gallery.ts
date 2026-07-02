import { AfterViewInit , Component, Renderer2 } from '@angular/core';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-gallery',
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
})
export class Gallery {}
