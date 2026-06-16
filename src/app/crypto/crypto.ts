import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

declare const $: any;
declare const Chart: any;

type CryptoCoin = {
  image: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
};

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [Footer, Header, Sidebar, CommonModule],
  templateUrl: './crypto.html',
  styleUrls: ['./crypto.css']
})
export class Crypto implements AfterViewInit {
  private _table1: any;
  private priceChart: any;

  totalCoins = 0;
  marketCap = '';
  totalVolume = '';
  totalMarkets = 0;
  activeCoins = 0;
  lastUpdate = '';
  topGainers: CryptoCoin[] = [];
  topLosers: CryptoCoin[] = [];

  chartRange = '1';
  readonly chartRanges = [
    { label: '1D', value: '1' },
    { label: '7D', value: '7' },
    { label: '1M', value: '30' },
    { label: '3M', value: '90' },
    { label: '1Y', value: '365' },
    { label: 'ALL', value: 'max' }
  ];

  private apiKey = 'CG-Jm7v63hRgb163BSyMarDHruu';

  constructor(
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {}

  ngAfterViewInit(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapsed');

    this._table1 = $('#table1').DataTable({
      pageLength: 10,
      responsive: true,
      searching: false,
      lengthChange: false,
      info: false,
      ordering: false,
      paging: true
    });

    this.loadGlobalData();
    this.bindTable1();
    this.loadMarketChart(this.chartRange);
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'x-cg-demo-api-key': this.apiKey
      })
    };
  }

  private loadGlobalData() {
    this.httpClient
      .get('https://api.coingecko.com/api/v3/global', this.getHeaders())
      .subscribe((res: any) => {
        this.totalCoins = res.data.active_cryptocurrencies;
        this.activeCoins = res.data.active_cryptocurrencies;
        this.totalMarkets = res.data.markets;
        this.marketCap = '$' + Math.round(res.data.total_market_cap.usd).toLocaleString();
        this.totalVolume = '$' + Math.round(res.data.total_volume.usd).toLocaleString();
        this.lastUpdate = new Date().toLocaleString();
      });
  }

  private bindTable1() {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd' +
      '&order=market_cap_desc' +
      '&per_page=50' +
      '&page=1';

    this.httpClient.get<CryptoCoin[]>(url, this.getHeaders()).subscribe((coins) => {
      $('#tanggal').html('Market update: ' + this.lastUpdate);
      this._table1.clear();

      const sortedByChange = [...coins].sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      );

      this.topGainers = sortedByChange.slice(0, 3);
      this.topLosers = sortedByChange.slice(-3).reverse();

      let index = 1;

      coins.forEach((coin) => {
        const change = coin.price_change_percentage_24h || 0;
        const badge =
          change >= 0
            ? `<span class="market-change positive">+${change.toFixed(2)}%</span>`
            : `<span class="market-change negative">${change.toFixed(2)}%</span>`;

        const row = [
          index++,
          `<img src="${coin.image}" alt="${coin.name}" width="24" height="24" />`,
          `${coin.name}`,
          `${coin.symbol.toUpperCase()}`,
          '$' + Number(coin.current_price).toLocaleString(),
          badge,
          '$' + Number(coin.market_cap).toLocaleString()
        ];

        this._table1.row.add(row);
      });

      this._table1.draw(false);
    });
  }

  setChartRange(range: string) {
    if (this.chartRange === range) {
      return;
    }

    this.chartRange = range;
    this.loadMarketChart(range);
  }

  private loadMarketChart(days: string) {
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;
    this.httpClient.get(url, this.getHeaders()).subscribe((res: any) => {
      const prices = res.prices || [];
      const labels = prices.map((item: any) => {
        const date = new Date(item[0]);
        return days === '1'
          ? `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          : `${date.getDate()}/${date.getMonth() + 1}`;
      });
      const data = prices.map((item: any) => Number(item[1].toFixed(2)));
      this.buildPriceChart(labels, data);
    });
  }

  private buildPriceChart(labels: string[], data: number[]) {
    const canvas = document.getElementById('cryptoTrendChart') as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    if (this.priceChart) {
      this.priceChart.data.labels = labels;
      this.priceChart.data.datasets[0].data = data;
      this.priceChart.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    this.priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Bitcoin price',
            data,
            borderColor: '#7b5cff',
            backgroundColor: 'rgba(123, 92, 255, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#9ea8d4', maxRotation: 0, autoSkip: true },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#9ea8d4' },
            grid: { color: 'rgba(255,255,255,0.08)' }
          }
        }
      }
    });
  }
}
