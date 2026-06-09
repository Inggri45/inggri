import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { HttpClient } from '@angular/common/http';

declare const $: any;
@Component({
  selector: 'app-saham',
  standalone: true,
  imports: [Footer, Header, Sidebar, CommonModule],
  templateUrl: './saham.html',
  styleUrl: './saham.css'
})
export class Saham implements AfterViewInit {
  private _table1: any;
  constructor(
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {}

  ngAfterViewInit(): void {
    // Mengatur sidebar
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapsed');

    // Inisialisasi DataTable
    this._table1 = $('#table1').DataTable({
      columnDefs: [
        {
          targets: [3, 4, 5, 6],
          className: 'text-right'
        }
      ]
    });

    this.bindTable1();
  }

  bindTable1(): void {
    const apiKey = 'e49e65d8bfe84ac59f70d2d4bf27470e';
    const symbols = [
      'AAPL',
      'MSFT',
      'NVDA',
      'TSLA',
      'META',
      'AMZN',
      'GOOGL'
    ];

    $('#tanggal').html(
      'Data Saham per tanggal ' + this.formatDate(new Date())
    );

    this._table1.clear();
    let no = 1;
    symbols.forEach(symbol => {
      const url =
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
      this.httpClient.get(url).subscribe({
        next: (data: any) => {
          const harga = parseFloat(data.close || 0).toFixed(2);
          const perubahan = parseFloat(data.change || 0).toFixed(2);
          const persen = parseFloat(data.percent_change || 0).toFixed(2);
          const volume = Number(data.volume || 0).toLocaleString();
          const row = [
            no++,
            data.symbol,
            data.name,
            harga,
            perubahan,
            persen + '%',
            volume
          ];
          this._table1.row.add(row);
          this._table1.draw(false);
        },
        error: (err) => {
          console.error(
            'Gagal mengambil data saham:',
            symbol,
            err
          );
        }
      });
    });
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  }
}
