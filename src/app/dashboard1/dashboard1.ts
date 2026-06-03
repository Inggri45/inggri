import { AfterViewInit, Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';

declare const $: any;
declare const Chart: any;
declare const Sparkline: any;

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './dashboard1.html',
  styleUrls: ['./dashboard1.css'],
})
export class Dashboard1 implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initDashboardCharts();
  }

  private initDashboardCharts(): void {
    if (typeof $ === 'undefined' || typeof Chart === 'undefined') {
      return;
    }

    const revenueCanvas = $('#revenue-chart-canvas').get(0);
    if (revenueCanvas) {
      const revenueCtx = revenueCanvas.getContext('2d');
      const revenueData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Digital Goods',
            backgroundColor: 'rgba(60,141,188,0.9)',
            borderColor: 'rgba(60,141,188,0.8)',
            pointRadius: false,
            pointColor: '#3b8bba',
            pointStrokeColor: 'rgba(60,141,188,1)',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(60,141,188,1)',
            data: [28, 48, 40, 19, 86, 27, 90]
          },
          {
            label: 'Electronics',
            backgroundColor: 'rgba(210, 214, 222, 1)',
            borderColor: 'rgba(210, 214, 222, 1)',
            pointRadius: false,
            pointColor: 'rgba(210, 214, 222, 1)',
            pointStrokeColor: '#c1c7d1',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          }
        ]
      };

      const revenueOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            }
          }]
        }
      };

      new Chart(revenueCtx, {
        type: 'line',
        data: revenueData,
        options: revenueOptions
      });
    }

    const salesCanvas = $('#sales-chart-canvas').get(0);
    if (salesCanvas) {
      const salesCtx = salesCanvas.getContext('2d');
      const pieData = {
        labels: ['Instore Sales', 'Download Sales', 'Mail-Order Sales'],
        datasets: [{
          data: [30, 12, 20],
          backgroundColor: ['#f56954', '#00a65a', '#f39c12']
        }]
      };
      const pieOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: false
        }
      };

      new Chart(salesCtx, {
        type: 'doughnut',
        data: pieData,
        options: pieOptions
      });
    }

    const salesGraphCanvas = $('#line-chart').get(0);
    if (salesGraphCanvas) {
      const salesGraphCtx = salesGraphCanvas.getContext('2d');
      const salesGraphData = {
        labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
        datasets: [{
          label: 'Digital Goods',
          fill: false,
          borderWidth: 2,
          lineTension: 0,
          spanGaps: true,
          borderColor: '#efefef',
          pointRadius: 3,
          pointHoverRadius: 7,
          pointColor: '#efefef',
          pointBackgroundColor: '#efefef',
          data: [2666, 2778, 4912, 3767, 6810, 5670, 4820, 15073, 10687, 8432]
        }]
      };
      const salesGraphOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: '#efefef'
            },
            gridLines: {
              display: false,
              color: '#efefef',
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: '#efefef'
            },
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.2)',
              drawBorder: false
            }
          }]
        }
      };

      new Chart(salesGraphCtx, {
        type: 'line',
        data: salesGraphData,
        options: salesGraphOptions
      });
    }

    const sparkline1 = $('#sparkline-1').get(0);
    const sparkline2 = $('#sparkline-2').get(0);
    const sparkline3 = $('#sparkline-3').get(0);
    if (sparkline1 && typeof Sparkline !== 'undefined') {
      new Sparkline(sparkline1, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' }).draw([1000, 1200, 920, 927, 931, 1027, 819, 930, 1021]);
    }
    if (sparkline2 && typeof Sparkline !== 'undefined') {
      new Sparkline(sparkline2, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' }).draw([515, 519, 520, 522, 652, 810, 370, 627, 319, 630, 921]);
    }
    if (sparkline3 && typeof Sparkline !== 'undefined') {
      new Sparkline(sparkline3, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' }).draw([15, 19, 20, 22, 33, 27, 31, 27, 19, 30, 21]);
    }
  }
}
