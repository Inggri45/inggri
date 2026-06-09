import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

import * as L from 'leaflet';

import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { Footer } from "../footer/footer";

declare const $: any;
declare const moment: any;

@Component({
    selector: "app-cuaca",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        Header,
        Sidebar,
        Footer,
        RouterModule
    ],
    templateUrl: "./cuaca.html",
    styleUrls: ["./cuaca.css"],
})
export class Cuaca implements OnInit, AfterViewInit {

    private table1: any;
    private map: any;
    private userMarker: any;
    private watchId: number | null = null;
    private locationRequestInProgress = false;
    following = false;
    autoFollowOnLoad = true;

    cityQuery: string = '';
    locationStatus: 'idle' | 'pending' | 'granted' | 'denied' = 'idle';
    locationError: string = '';
    locationMessage: string = '';
    searchError: string = '';
    supportsGeolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    cityData: any;
    currentWeather: any;
    weatherClass: string = '';
    weatherIconClass: string = '';
    todayDate: string = "";

    constructor(
        private renderer: Renderer2,
        private http: HttpClient
    ) {

        this.renderer.removeClass(document.body, "sidebar-open");
        this.renderer.removeClass(document.body, "sidebar-collapsed");
        this.renderer.removeClass(document.body, "sidebar-collapse");

        this.renderer.addClass(document.body, "sidebar-closed");
    }

    ngOnInit(): void {
        if (this.autoFollowOnLoad && this.supportsGeolocation) {
            this.locationStatus = 'pending';
            this.locationMessage = 'Menghubungkan ke GPS Anda...';
            this.requestLocation();
        }
    }

    ngAfterViewInit(): void {

        this.table1 = $("#table1").DataTable({

            columnDefs: [

                {
                    targets: 0,

                    render: function (data: string) {

                        const waktu =
                            moment(data + " UTC");

                        const html =
                            waktu.local().format("YYYY-MM-DD")
                            + "<br />"
                            + waktu.local().format("HH:mm")
                            + " WIB";

                        return html;
                    }
                },

                {
                    targets: [1],

                    render: function (data: string) {

                        return (
                            "<img src='" +
                            data +
                            "' style='filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.7));' />"
                        );
                    }
                },

                {
                    targets: [2],

                    render: function (data: string) {

                        const array =
                            data.split("||");

                        const cuaca =
                            array[0];

                        const description =
                            array[1];

                        const html =
                            "<strong>" +
                            cuaca +
                            "</strong><br/>" +
                            description;

                        return html;
                    }
                }

            ]

        });

            // Try to get initial position automatically
            if (this.autoFollowOnLoad && this.supportsGeolocation) {
                this.locationStatus = 'pending';
                this.locationMessage = 'Memuat cuaca dari lokasi Anda secara otomatis...';
                this.requestLocation();
            }
    }

    private readonly apiKey = 'd219424c8188579492a9e6af91d16740';

    getData(city: string): void {
        city = city.trim();
        if (!city) {
            this.searchError = 'Masukkan nama kota, misalnya Pontianak.';
            return;
        }

        this.searchError = '';
        let query = city;
        if (city.toLowerCase().includes('pontianak')) {
            query = 'Pontianak,ID';
        }

        const encodedCity = encodeURIComponent(query);

        this.http
            .get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${this.apiKey}`
            )
            .subscribe(
                (data: any) => {
                    this.cityData = {
                        name: data.name,
                        country: data.sys.country,
                        coord: data.coord
                    };

                    this.currentWeather = data;
                    this.applyConditionStyles();
                    this.todayDate = moment
                        .unix(data.dt)
                        .utcOffset(data.timezone / 60)
                        .format('MMM DD, hh:mma');

                    this.locationMessage = `Koordinat: ${data.coord.lat.toFixed(5)}, ${data.coord.lon.toFixed(5)}.`;

                    setTimeout(() => {
                        this.initMap(
                            this.cityData.coord.lat,
                            this.cityData.coord.lon
                        );
                    }, 100);

                    this.loadForecast(encodedCity);
                },
                (error: any) => {
                    this.searchError = `Tidak ditemukan: ${city}. Coba gunakan tombol Lokasi Saya.`;
                    if (this.supportsGeolocation) {
                        this.locationMessage = 'Jika kota tidak ditemukan, tekan Lokasi Saya untuk mendeteksi dari GPS.';
                    }
                }
            );
    }

    getDataByCoords(lat: number, lon: number): void {
        const latNum = Number(lat);
        const lonNum = Number(lon);

        this.http
            .get(`https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${this.apiKey}`)
            .subscribe((data: any) => {
                this.cityData = {
                    name: data.name,
                    country: data.sys?.country,
                    coord: data.coord
                };

                this.currentWeather = data;
                this.applyConditionStyles();
                this.todayDate = moment.unix(data.dt).utcOffset(data.timezone / 60).format('MMM DD, hh:mma');

                setTimeout(() => {
                    this.initMap(this.cityData.coord.lat, this.cityData.coord.lon);
                    this.updateUserMarker(latNum, lonNum);
                }, 100);

                this.loadForecast(encodeURIComponent(this.cityData.name));
            }, (err: any) => {
                console.warn('getDataByCoords error', err);
            });
    }

    startFollow(): void {
        if (!('geolocation' in navigator)) {
            alert('Geolocation not supported by this browser.');
            return;
        }

        if (this.watchId != null) {
            return;
        }

        this.watchId = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            this.following = true;
            this.updateUserMarker(lat, lon);
        }, (err) => {
            console.warn('watchPosition error', err);
        }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    }

    stopFollow(): void {
        if (this.watchId != null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.following = false;
    }

    toggleFollow(): void {
        if (this.following) {
            this.stopFollow();
        } else {
            this.startFollow();
        }
    }

    requestLocation(): void {
        if (!this.supportsGeolocation) {
            this.locationError = 'Geolocation tidak didukung oleh browser ini.';
            this.locationStatus = 'denied';
            this.loadDefaultCity();
            return;
        }

        if (this.locationStatus === 'pending') {
            return;
        }

        if (this.locationRequestInProgress) {
            return;
        }

        this.locationRequestInProgress = true;
        this.locationStatus = 'pending';
        this.locationError = '';
        this.locationMessage = 'Mendeteksi lokasi Anda dari GPS atau WiFi...';

        this.tryGeolocationWithFallback();
    }

    private tryGeolocationWithFallback(): void {
        // Fallback timer - if geolocation takes too long total, load default city
        const totalTimeoutId = setTimeout(() => {
            if (this.locationStatus === 'pending') {
                console.warn('Geolocation timeout - loading default city');
                this.locationStatus = 'idle';
                this.locationMessage = '';
                this.locationRequestInProgress = false;
                this.loadDefaultCity();
            }
        }, 25000);

        // Try with high accuracy first (GPS)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(totalTimeoutId);
                this.handleLocationSuccess(pos);
            },
            (err) => {
                // If high accuracy fails, try with low accuracy (WiFi/IP)
                console.warn('High accuracy geolocation failed:', err.code, 'Trying WiFi/IP based location...');
                this.tryLowAccuracyLocation(totalTimeoutId);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    }

    private tryLowAccuracyLocation(totalTimeoutId: number): void {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(totalTimeoutId);
                this.handleLocationSuccess(pos);
            },
            (err) => {
                clearTimeout(totalTimeoutId);
                this.handleLocationError(err);
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 0
            }
        );
    }

    private handleLocationSuccess(pos: GeolocationPosition): void {
        this.locationRequestInProgress = false;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.locationStatus = 'granted';
        this.locationError = '';
        const accuracy = pos.coords.accuracy ? ` (akurasi: ${Math.round(pos.coords.accuracy)}m)` : '';
        this.locationMessage = `Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}${accuracy}`;
        this.cityQuery = '';
        this.getDataByCoords(lat, lon);
        this.startFollow();
    }

    private handleLocationError(err: GeolocationPositionError): void {
        this.locationRequestInProgress = false;
        this.locationStatus = 'denied';

        if (err.code === 1) {
            this.locationError = 'Izinkan akses lokasi di pengaturan browser Anda.';
        } else if (err.code === 2) {
            this.locationError = 'Lokasi tidak dapat ditentukan. Cek koneksi WiFi atau GPS Anda.';
        } else {
            this.locationError = 'Tidak dapat mendeteksi lokasi. Coba manual cari kota.';
        }

        this.locationMessage = '';
        console.warn('Geolocation error:', err.code, err.message);
        this.loadDefaultCity();
    }

    private loadDefaultCity(): void {
        // Fallback: Load Pontianak weather
        this.cityQuery = 'Pontianak';
        this.getData('Pontianak');
    }

    updateUserMarker(lat: number, lon: number): void {
        if (!this.map) return;

        if (this.userMarker) {
            this.userMarker.setLatLng([lat, lon]);
        } else {
            this.userMarker = L.circleMarker([lat, lon], {
                radius: 8,
                color: '#007bff',
                fillColor: '#007bff',
                fillOpacity: 0.9
            }).addTo(this.map).bindPopup('You are here');
        }

        this.map.panTo([lat, lon]);
    }

    private loadForecast(city: string): void {
        this.http
            .get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}`
            )
            .subscribe(
                (data: any) => {
                    const list = data.list || [];

                    if (this.table1) {
                        this.table1.clear();

                        list.forEach((element: any) => {
                            const weather = element.weather[0];
                            const iconUrl =
                                'https://openweathermap.org/img/wn/' +
                                weather.icon +
                                '@2x.png';
                            const cuacaDeskripsi =
                                weather.main + '||' + weather.description;
                            const main = element.main;
                            const tempMin = this.kelvinToCelcius(main.temp_min);
                            const tempMax = this.kelvinToCelcius(main.temp_max);
                            const temp = tempMin + '°C - ' + tempMax + '°C';
                            const row = [
                                element.dt_txt,
                                iconUrl,
                                cuacaDeskripsi,
                                temp
                            ];
                            this.table1.row.add(row);
                        });

                        this.table1.draw(false);
                    }
                },
                (error: any) => {
                    console.warn('Failed to load forecast', error);
                }
            );
    }

    kelvinToCelcius(kelvin: any): any {
        let celcius = kelvin - 273.15;
        celcius = Math.round(celcius * 100) / 100;
        return celcius;
    }

    calculateDewPoint(tempKelvin: number, humidity: number): number {
        const tempC = tempKelvin - 273.15;
        const a = 17.27;
        const b = 237.7;
        const alpha =
            ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
        return Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
    }

    getVisibilityKm(value: number): number {
        return value / 1000;
    }

    getWeatherIconUrl(icon: string): string {

        return (
            "https://openweathermap.org/img/wn/" +
            icon +
            "@2x.png"
        );
    }

    getWindDirection(
        deg: number
    ): string {

        const directions = [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW"
        ];

        return directions[
            Math.round(deg / 45) % 8
        ];
    }

    private applyConditionStyles(): void {
        if (!this.currentWeather || !this.currentWeather.weather || !this.currentWeather.weather[0]) {
            this.weatherClass = '';
            this.weatherIconClass = 'fas fa-question';
            return;
        }

        const main = (this.currentWeather.weather[0].main || '').toLowerCase();

        if (main.includes('clear')) {
            this.weatherClass = 'cond-clear cond-sunny';
            this.weatherIconClass = 'fas fa-sun';
        } else if (main.includes('cloud')) {
            this.weatherClass = 'cond-clouds';
            this.weatherIconClass = 'fas fa-cloud';
        } else if (main.includes('rain')) {
            this.weatherClass = 'cond-rain';
            this.weatherIconClass = 'fas fa-cloud-showers-heavy';
        } else if (main.includes('drizzle')) {
            this.weatherClass = 'cond-drizzle';
            this.weatherIconClass = 'fas fa-cloud-rain';
        } else if (main.includes('snow')) {
            this.weatherClass = 'cond-snow';
            this.weatherIconClass = 'fas fa-snowflake';
        } else if (main.includes('thunder')) {
            this.weatherClass = 'cond-thunderstorm';
            this.weatherIconClass = 'fas fa-bolt';
        } else if (main.includes('mist') || main.includes('fog') || main.includes('haze')) {
            this.weatherClass = 'cond-mist';
            this.weatherIconClass = 'fas fa-smog';
        } else {
            this.weatherClass = '';
            this.weatherIconClass = 'fas fa-cloud-sun';
        }
    }

    private initMap(
        lat: number,
        lon: number
    ): void {

        if (this.map) {
            this.map.remove();
        }

        this.map = L.map(
            "map-container"
        ).setView(
            [lat, lon],
            13
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "© OpenStreetMap contributors",
            }
        ).addTo(this.map);

        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);

        L.circleMarker([lat, lon], {
            radius: 8,
            color: '#1976d2',
            fillColor: '#1976d2',
            fillOpacity: 0.8
        })
            .addTo(this.map)
            .bindPopup(this.cityData.name)
            .openPopup();
    }

    handleEnter(
        event: any
    ) {

        const cityName =
            event.target.value;

        if (cityName === "") {

            this.table1.clear();

            this.table1.draw(
                false
            );

            return;
        }

        this.getData(
            cityName
        );
    }
}
