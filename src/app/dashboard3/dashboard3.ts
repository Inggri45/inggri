import { AfterViewInit, Component } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';

declare const $: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard3',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './dashboard3.html',
  styleUrls: ['./dashboard3.css'],
})
export class Dashboard3 implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initDashboard3Charts();
  }

  private initDashboard3Charts(): void {
    if (typeof $ === 'undefined' || typeof Chart === 'undefined') {
      return;
    }

    const salesChartElement = $('#sales-chart').get(0);
    if (salesChartElement) {
      const salesChartCtx = salesChartElement.getContext('2d');
      new Chart(salesChartCtx, {
        type: 'bar',
        data: {
          labels: ['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
          datasets: [
            {
              backgroundColor: '#007bff',
              borderColor: '#007bff',
              data: [1000, 2000, 3000, 2500, 2700, 2500, 3000]
            },
            {
              backgroundColor: '#ced4da',
              borderColor: '#ced4da',
              data: [700, 1700, 2700, 2000, 1800, 1500, 2000]
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          tooltips: {
            mode: 'index',
            intersect: true
          },
          hover: {
            mode: 'index',
            intersect: true
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              gridLines: {
                display: true,
                lineWidth: '4px',
                color: 'rgba(0, 0, 0, .2)',
                zeroLineColor: 'transparent'
              },
              ticks: {
                beginAtZero: true,
                callback: (value: number) => {
                  if (value >= 1000) {
                    return '$' + (value / 1000) + 'k';
                  }
                  return '$' + value;
                },
                fontColor: '#495057',
                fontStyle: 'bold'
              }
            }],
            xAxes: [{
              display: true,
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: '#495057',
                fontStyle: 'bold'
              }
            }]
          }
        }
      });
    }

    const visitorsChartElement = $('#visitors-chart').get(0);
    if (visitorsChartElement) {
      const visitorsChartCtx = visitorsChartElement.getContext('2d');
      new Chart(visitorsChartCtx, {
        type: 'line',
        data: {
          labels: ['18th', '20th', '22nd', '24th', '26th', '28th', '30th'],
          datasets: [
            {
              type: 'line',
              data: [100, 120, 170, 167, 180, 177, 160],
              backgroundColor: 'transparent',
              borderColor: '#007bff',
              pointBorderColor: '#007bff',
              pointBackgroundColor: '#007bff',
              fill: false
            },
            {
              type: 'line',
              data: [60, 80, 70, 67, 80, 77, 100],
              backgroundColor: 'transparent',
              borderColor: '#ced4da',
              pointBorderColor: '#ced4da',
              pointBackgroundColor: '#ced4da',
              fill: false
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          tooltips: {
            mode: 'index',
            intersect: true
          },
          hover: {
            mode: 'index',
            intersect: true
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              gridLines: {
                display: true,
                lineWidth: '4px',
                color: 'rgba(0, 0, 0, .2)',
                zeroLineColor: 'transparent'
              },
              ticks: {
                beginAtZero: true,
                suggestedMax: 200,
                fontColor: '#495057',
                fontStyle: 'bold'
              }
            }],
            xAxes: [{
              display: true,
              gridLines: {
                display: false
              },
              ticks: {
                fontColor: '#495057',
                fontStyle: 'bold'
              }
            }]
          }
        }
      });
    }
  }
}
