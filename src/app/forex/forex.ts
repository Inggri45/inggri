import { AfterViewInit, Component, Renderer2 } from '@angular/core';
import { CommonModule, formatCurrency } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { HttpClient } from '@angular/common/http';

// Deklarasi jQuery untuk DataTables
declare const $: any;

@Component({
  selector: 'app-forex',
  standalone: true,
  imports: [Footer, Header, Sidebar, CommonModule],
  templateUrl: './forex.html',
  styleUrl: './forex.css'
})
export class Forex implements AfterViewInit {
  private _table1: any;

  constructor(private renderer: Renderer2, private httpClient: HttpClient) {}

  ngAfterViewInit(): void {
    // 1. Mengatur Class Body
    this.renderer.removeClass(document.body, "sidebar-open");
    this.renderer.addClass(document.body, "sidebar-closed");
    this.renderer.addClass(document.body, "sidebar-collapsed");

    // 2. Inisialisasi DataTables pada #table1
    this._table1 = $("#table1").DataTable({
      "columnDefs": [
        {
          "targets": 3,
          "className": "text-right" // Agar kolom Kurs rata kanan
        }
      ]
    });

    // 3. Panggil fungsi bind data
    this.bindTable1();
  }

  bindTable1(): void {
    console.log("bindTable1() dijalankan");

    const ratesUrl = "https://openexchangerates.org/api/latest.json?app_id=f0234ed933ca49f8aaed4e881fe0b909";
    const currenciesUrl = "https://openexchangerates.org/api/currencies.json";

    // Request pertama: Ambil nama-nama mata uang
    this.httpClient.get(currenciesUrl).subscribe((currencies: any) => {

      // Request kedua: Ambil nilai tukar (rates)
      this.httpClient.get(ratesUrl).subscribe((data: any) => {

        // Tampilkan tanggal di elemen #tanggal (sesuai gambar)
        $("#tanggal").html("Data per tanggal " + this.formatDate(new Date(data.timestamp * 1000)));

        const rates = data.rates;
        let index = 1;

        // Kosongkan tabel sebelum diisi ulang (opsional, untuk mencegah duplikasi jika dipanggil ulang)
        this._table1.clear();

        // Loop melalui setiap mata uang yang ada di data rates
        for (const currency in rates) {

          // Ambil nama mata uang dari hasil request pertama
          const currencyName = currencies[currency];

          // Hitung nilai tukar terhadap IDR (sesuai logika gambar)
          // Rumus: Rate IDR dibagi Rate Mata Uang Target
          const rate = rates.IDR / rates[currency];

          // Format angka menjadi format mata uang
          const formatRate = formatCurrency(rate, "en-US", "", currency);

          console.log(`${currency}: ${currencyName} - ${formatRate}`);

          // Siapkan baris data: [No, Kode Mata Uang, Nama Mata Uang, Kurs]
          const row = [index++, currency, currencyName, formatRate];

          // Tambahkan ke DataTable
          this._table1.row.add(row);
        }

        // Gambar ulang tabel agar data muncul
        this._table1.draw(false);
      });
    });
  }

  // Fungsi helper untuk memformat tanggal (diperlukan karena dipanggil di bindTable1)
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  }
}
