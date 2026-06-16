import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';

declare const $: any;

@Component({
  selector: 'app-saham',
  standalone: true,
  imports: [Footer, Header, Sidebar, CommonModule],
  templateUrl: './saham.html',
  styleUrls: ['./saham.css']
})
export class Saham implements AfterViewInit {

  private _table1: any;
  // Statistik
  naik = 0;
  turun = 0;
  total = 0;

  // Data Grafik
  stockNames: string[] = [];
  stockPrices: number[] = [];
  chart: any;

  constructor(
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {}

  ngAfterViewInit(): void {
    // Sidebar setup
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapsed');

    // DataTable init
    this._table1 = $('#table1').DataTable({
      responsive: {
        breakpoints: [
          { name: 'desktop', width: Infinity },
          { name: 'tablet', width: 1024 },
          { name: 'phone', width: 768 }
        ],
        details: {
          type: 'column',
          target: 0,
          renderer: function (api: any, rowIdx: number, columns: any[]) {
            const data = columns
              .filter((col: any) => col.hidden && col.title && col.title !== '')
              .map((col: any) => {
                return '<tr>' +
                  '<td class="font-weight-bold">' + col.title + '</td>' +
                  '<td>' + col.data + '</td>' +
                  '</tr>';
              })
              .join('');

            return data ? '<table class="table table-sm table-borderless mb-0">' + data + '</table>' : false;
          }
        }
      },
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          targets: 0
        },
        {
          targets: [4, 5, 6, 7],
          className: 'text-right'
        }
      ],
      order: [[1, 'asc']],
      autoWidth: false
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

    // Tanggal
    $('#tanggal').html(
      'Data Saham per tanggal ' + this.formatDate(new Date())
    );

    // RESET DATA
    this._table1.clear();
    this._table1.draw(false);
    this.naik = 0;
    this.turun = 0;
    this.total = 0;
    this.stockNames = [];
    this.stockPrices = [];
    let no = 1;
    const requests = symbols.map(symbol => {
      const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
      return this.httpClient.get(url);
    });

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        results.forEach((data: any) => {
          const harga = parseFloat(data.close || 0);
          const perubahan = parseFloat(data.change || 0);
          const persen = parseFloat(data.percent_change || 0);
          const volume = Number(data.volume || 0).toLocaleString();

          // Statistik
          this.total++;
          if (perubahan >= 0) {
            this.naik++;
          } else {
            this.turun++;
          }

          // Data chart
          this.stockNames.push(data.symbol);
          this.stockPrices.push(harga);

          // Table row
          const row = [
            '',
            no++,
            data.symbol,
            data.name,
            '$ ' + harga.toFixed(2),
            perubahan.toFixed(2),
            persen.toFixed(2) + '%',
            volume
          ];

          this._table1.row.add(row);
        });

        // render table sekali saja (lebih stabil)
        this._table1.draw(false);

        // buat chart
        this.createChart();
      },
      error: (err) => {
        console.error('Gagal mengambil data saham:', err);
      }
    });
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.stockNames,
        datasets: [
          {
            label: 'Harga Saham (USD)',
            data: this.stockPrices,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
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
