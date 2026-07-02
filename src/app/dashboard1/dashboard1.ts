import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const $: any;
declare const Chart: any;

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule, CommonModule],
  templateUrl: './dashboard1.html',
  styleUrls: ['./dashboard1.css'],
})
export class Dashboard1 implements AfterViewInit {

  // Data Mahasiswa (Gender) - Untuk stat box
  totalLaki = 250;
  totalPerempuan = 129;
  totalSemua = 379;

  // Data Jurusan/Prodi - Untuk donut chart
  dataJurusan: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  totalJurusan = 0;
  jurusanItems: Array<{ label: string; code: string; value: number; color: string }> = [];

  // Simpan objek grafik
  private jurusanDonutChart: any = null;
  private areaChart: any = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    $('body').removeClass('sidebar-open').addClass('sidebar-closed sidebar-collapsed');
    this.muatDataDanGrafik();
    setTimeout(() => this.initDashboardWidgets(), 100);
  }

  private initDashboardWidgets(retry = 0): void {
    if (typeof $ === 'undefined') {
      console.warn('jQuery tidak tersedia untuk init dashboard widgets');
      return;
    }

    const mapElement = document.getElementById('world-map');
    if (!mapElement && retry < 3) {
      setTimeout(() => this.initDashboardWidgets(retry + 1), 200);
      return;
    }

    const moment = (window as any).moment;
    if ($.fn.daterangepicker && moment) {
      $('.daterange').daterangepicker({
        ranges: {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate: moment()
      });
    }

    if ($.fn.knob) {
      $('.knob').knob();
    }

    if ($.fn.vectorMap) {
      const visitorsData: Record<string, number> = {
        US: 398,
        SA: 400,
        CA: 1000,
        DE: 500,
        FR: 760,
        CN: 300,
        AU: 700,
        BR: 600,
        IN: 800,
        GB: 320,
        RU: 3000
      };

      $('#world-map').vectorMap({
        map: 'usa_en',
        backgroundColor: 'transparent',
        regionStyle: {
          initial: {
            fill: 'rgba(255, 255, 255, 0.7)',
            'fill-opacity': 1,
            stroke: 'rgba(0,0,0,.2)',
            'stroke-width': 1,
            'stroke-opacity': 1
          }
        },
        series: {
          regions: [{
            values: visitorsData,
            scale: ['#ffffff', '#0154ad'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionLabelShow: function (e: any, el: any, code: string) {
          const visitorsCount = visitorsData[code];
          if (typeof visitorsCount !== 'undefined') {
            el.html(el.html() + ': ' + visitorsCount + ' new visitors');
          }
        }
      });
    }

    const Sparkline = (window as any).Sparkline;
    if (Sparkline) {
      const chart1 = new Sparkline(document.getElementById('sparkline-1') as HTMLElement, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' });
      const chart2 = new Sparkline(document.getElementById('sparkline-2') as HTMLElement, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' });
      const chart3 = new Sparkline(document.getElementById('sparkline-3') as HTMLElement, { width: 80, height: 50, lineColor: '#92c1dc', endColor: '#ebf4f9' });
      chart1.draw([1000, 1200, 920, 927, 931, 1027, 819, 930, 1021]);
      chart2.draw([515, 519, 520, 522, 652, 810, 370, 627, 319, 630, 921]);
      chart3.draw([15, 19, 20, 22, 33, 27, 31, 27, 19, 30, 21]);
    }

    if ($.fn.datetimepicker) {
      $('#calendar').datetimepicker({
        format: 'L',
        inline: true
      });
    }

    this.initLineChart();
  }

  private initLineChart(): void {
    const chartElement = document.getElementById('line-chart') as HTMLCanvasElement;
    if (!chartElement) {
      return;
    }

    const ctx = chartElement.getContext('2d');
    if (!ctx) {
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2', '2012 Q3', '2012 Q4', '2013 Q1', '2013 Q2'],
        datasets: [{
          label: 'Sales',
          data: [2666, 2778, 4912, 3767, 6810, 5670, 4820, 15073, 10687, 8432],
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#ffffff'
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { display: false, color: '#efefef' }
          },
          y: {
            ticks: { color: '#ffffff', stepSize: 5000 },
            grid: { display: true, color: '#efefef' }
          }
        }
      }
    });
  }

  private muatDataDanGrafik() {
    // Load data gender untuk stat box dan area chart
    this.http.get<any>('https://stmikpontianak.cloud/011100862/laporan_bulanLahirMahasiswa.php')
      .subscribe({
        next: (res) => {
          // Hitung total dari data API
          this.totalLaki = res.datasets[0]?.data.reduce((a: number, b: number) => a + Number(b), 0) || 250;
          this.totalPerempuan = res.datasets[1]?.data.reduce((a: number, b: number) => a + Number(b), 0) || 129;
          this.totalSemua = this.totalLaki + this.totalPerempuan;

          this.buatGrafikArea(res);
        },
        error: () => {
          // Pakai data statis jika API gagal
          this.totalLaki = 250;
          this.totalPerempuan = 129;
          this.totalSemua = 379;
        }
      });

    // Load data Jurusan/Prodi untuk donut chart
    this.http.get<any>('https://stmikpontianak.cloud/011100862/laporan_rekapJurusanProdi.php')
      .subscribe({
        next: (res) => {
          this.dataJurusan = res;

          // Hitung total jurusan
          this.totalJurusan = Array.isArray(res.labels) ? res.labels.length : 0;

          // Buat donut chart untuk jurusan/prodi
          this.loadJurusanDonutChart(res);
        },
        error: (err) => {
          console.error('Error loading jurusan data:', err);
          // Data dummy jika API gagal
          this.dataJurusan = {
            labels: ['Sistem Informasi', 'Teknologi Informasi', 'Informatika', 'Manajemen Informatika', 'Komputerisasi Akuntansi'],
            datasets: [{
              data: [120, 90, 80, 60, 40],
              backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
            }]
          };
          this.totalJurusan = this.dataJurusan.labels.length;
          this.loadJurusanDonutChart(this.dataJurusan);
        }
      });
  }

  private buatGrafikArea(data: any) {
    const ctx = document.getElementById('revenue-chart-canvas') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy chart lama jika ada
    if (this.areaChart) {
      this.areaChart.destroy();
      this.areaChart = null;
    }

    this.areaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || [],
        datasets: data.datasets?.map((ds: any) => ({
          ...ds,
          borderColor: ds.label === 'Laki-laki' ? '#007bff' : '#6c757d',
          backgroundColor: ds.label === 'Laki-laki' ? 'rgba(0, 123, 255, 0.2)' : 'rgba(108, 117, 125, 0.2)',
          fill: true,
          tension: 0.3
        })) || []
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // ============= JURUSAN/PRODI DONUT CHART =============
  private loadJurusanDonutChart(data: any) {
    const defaultColors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1',
      '#fd7e14', '#20c997', '#6610f2', '#e83e8c', '#17a2b8', '#343a40'
    ];

    // Tunggu DOM siap
    setTimeout(() => {
      const canvas = document.getElementById('sales-chart-canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Canvas donut chart tidak ditemukan');
        return;
      }

      // Destroy chart lama jika ada
      if (this.jurusanDonutChart) {
        this.jurusanDonutChart.destroy();
        this.jurusanDonutChart = null;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('Context canvas tidak tersedia');
        return;
      }

      // Siapkan data untuk donut chart
      const labels: string[] = Array.isArray(data.labels) ? data.labels : [];
      const dataset = data.datasets?.[0] || { data: [] };
      const rawValues = Array.isArray(dataset.data) ? dataset.data : [];
      const values = rawValues.map((value: any) => Number(value) || 0);
      const colors = Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length > 0
        ? dataset.backgroundColor
        : defaultColors;

      this.jurusanItems = labels.map((label: string, idx: number) => ({
        label,
        code: this.formatJurusanCode(label),
        value: values[idx] || 0,
        color: colors[idx] || defaultColors[idx % defaultColors.length]
      }));

      // Hitung total untuk persentase
      const total = values.reduce((a: number, b: number) => a + Number(b), 0);

      this.jurusanDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              align: 'center',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                font: { size: 11 }
              }
            },
            title: {
              display: true,
              text: 'Distribusi Mahasiswa Berdasarkan Jurusan/Prodi',
              font: { size: 14, weight: 'bold' }
            },
            tooltip: {
              callbacks: {
                label: function(info: any) {
                  const persen = total > 0 ? ((info.raw / total) * 100).toFixed(1) : '0.0';
                  return `${info.label}: ${info.raw} mahasiswa (${persen}%)`;
                }
              }
            }
          }
        }
      });

      console.log('Jurusan donut chart berhasil dibuat');
    }, 300);
  }

  private formatJurusanCode(label: string): string {
    if (!label) {
      return '';
    }
    const parts = label.split(/\s+/).filter((part) => part.length > 0);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return parts.map((part) => part[0].toUpperCase()).join('');
  }
}
