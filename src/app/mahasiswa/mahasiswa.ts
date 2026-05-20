import { AfterViewInit , Component, Renderer2 } from '@angular/core';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-mahasiswa',
  standalone: true,
  imports: [Header, Sidebar, Footer, RouterModule],
  templateUrl: './mahasiswa.html',
  styleUrls: ['./mahasiswa.css'],
})
export class Mahasiswa implements AfterViewInit {
  data: any;
  table1: any;

  constructor(private httpClient: HttpClient, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-collapse');

    this.table1 = $('#table1').DataTable({
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
              .filter((col) => col.hidden && col.title && col.title !== '')
              .map((col) => {
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
        }
      ],
      order: [[1, 'asc']],
      autoWidth: false
    });

    this.loadMahasiswa();
  }

  showTambahModal(): void {
    $('#tambahModal').modal();
  }

  postRecord(): void {
    const alamat = String($('#alamatText').val() || '');
    let jenisKelamin = String($('#jenisKelaminSelect').val() || '');
    const jp = String($('#jpSelect').val() || '');
    const nama = String($('#namaText').val() || '');
    const nim = String($('#nimText').val() || '');
    const statusNikah = String($('#statusNikahSelect').val() || '');
    const tahunMasuk = String($('#tahunMasukInput').val() || '');
    const tanggalLahir = String($('#tanggalLahirInput').val() || '');
    const tempatLahir = String($('#tempatLahirText').val() || '');

    if (nim.length === 0) {
      alert('NIM belum diisi');
      return;
    }

    if (nama.length === 0) {
      alert('Nama belum diisi');
      return;
    }

    if (tempatLahir.length === 0) {
      alert('Tempat lahir belum diisi');
      return;
    }

    if (tanggalLahir.length === 0) {
      alert('Tanggal lahir belum diisi');
      return;
    }

    if (alamat.length === 0) {
      alert('Alamat belum diisi');
      return;
    }

    if (tahunMasuk.length === 0) {
      alert('Tahun masuk belum diisi');
      return;
    }

    if (jenisKelamin === 'L') {
      jenisKelamin = 'Laki-laki';
    } else if (jenisKelamin === 'P') {
      jenisKelamin = 'Perempuan';
    }

    const url = 'https://stmikpontianak.cloud/011100862/tambahMahasiswa.php' +
      '?alamat=' + encodeURIComponent(alamat) +
      '&jenisKelamin=' + encodeURIComponent(jenisKelamin) +
      '&jp=' + encodeURIComponent(jp) +
      '&nama=' + encodeURIComponent(nama) +
      '&nim=' + encodeURIComponent(nim) +
      '&statusPernikahan=' + encodeURIComponent(statusNikah) +
      '&tahunMasuk=' + encodeURIComponent(tahunMasuk) +
      '&tanggalLahir=' + encodeURIComponent(tanggalLahir) +
      '&tempatLahir=' + encodeURIComponent(tempatLahir);

    this.httpClient.get(url).subscribe((data: any) => {
      console.log(data);
      alert(data.status + ' --> ' + data.message);
      this.loadMahasiswa();
      $('#tambahModal').modal('hide');
    });
  }

  private loadMahasiswa(): void {
    this.httpClient.get('https://stmikpontianak.cloud/011100862/tampilMahasiswa.php').subscribe((data: any) => {
      console.table(data);
      this.table1.clear();

      data.forEach((element: any) => {
        const tempatTanggalLahir = element.TempatLahir + ', ' + element.tanggal_lahir;
        const rawJenisKelamin = String(
          element.Jenis_kelamin ?? element.Jeniskelamin ?? element.JenisKelamin ?? element.jenis_kelamin ?? element.jenisKelamin ?? ''
        ).trim();

        let jenisKelamin = rawJenisKelamin;
        if (jenisKelamin.toLowerCase() === 'l') {
          jenisKelamin = 'Laki-laki';
        } else if (jenisKelamin.toLowerCase() === 'p') {
          jenisKelamin = 'Perempuan';
        }

        const genderIcon = jenisKelamin.toLowerCase().includes('perempuan')
          ? "<i class='fas fa-venus text-danger'></i>"
          : jenisKelamin.toLowerCase().includes('laki-laki')
            ? "<i class='fas fa-mars text-primary'></i>"
            : '';

        const jenisKelaminFormatted = (jenisKelamin || 'Belum diisi') + (genderIcon ? ' ' + genderIcon : '');

        const row = [
          '',
          element.NIM,
          element.Nama,
          jenisKelaminFormatted,
          tempatTanggalLahir,
          element.JP,
          element.Alamat,
          element.StatusNikah,
          element.TahunMasuk
        ];

        this.table1.row.add(row);
      });

      this.table1.draw(false);
    });
  }
}
