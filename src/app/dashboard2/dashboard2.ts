import { AfterViewInit, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

declare const $: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [ RouterModule, Header, Sidebar, Footer ],
  templateUrl: './dashboard2.html',
  styleUrls: ['./dashboard2.css'],
})
export class Dashboard2 implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initDashboardCharts();
  }

  private initDashboardCharts(): void {
    if (typeof $ === 'undefined' || typeof Chart === 'undefined') {
      return;
    }

    const salesChartElement = $('#salesChart').get(0);
    if (salesChartElement) {
      const salesChartCanvas = salesChartElement.getContext('2d');
      const salesChartData = {
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

      const salesChartOptions = {
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

      new Chart(salesChartCanvas, {
        type: 'line',
        data: salesChartData,
        options: salesChartOptions
      });
    }

    const pieChartElement = $('#pieChart').get(0);
    if (pieChartElement) {
      const pieChartCanvas = pieChartElement.getContext('2d');
      const pieData = {
        labels: ['Chrome', 'IE', 'FireFox', 'Safari', 'Opera', 'Navigator'],
        datasets: [{
          data: [700, 500, 400, 600, 300, 100],
          backgroundColor: ['#f56954', '#00a65a', '#f39c12', '#00c0ef', '#3c8dbc', '#d2d6de']
        }]
      };
      const pieOptions = {
        legend: {
          display: false
        }
      };
      new Chart(pieChartCanvas, {
        type: 'doughnut',
        data: pieData,
        options: pieOptions
      });
    }

    if ($.fn.mapael && $('#world-map-markers').length) {
      $('#world-map-markers').mapael({
        map: {
          name: 'usa_states',
          zoom: {
            enabled: true,
            maxLevel: 10
          }
        }
      });
    }
  }
}
