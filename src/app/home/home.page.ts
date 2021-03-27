import { Component, ViewChild } from '@angular/core';
import { IonSlides, ToastController } from '@ionic/angular';

export class GeoZone {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: number;
  timezone: string;
  status: string;
}

export interface Datum {
  date: string;
  total_vaccinations: number;
  people_vaccinated: number;
  total_vaccinations_per_hundred: number;
  people_vaccinated_per_hundred: number;
  daily_vaccinations?: number;
  daily_vaccinations_per_million?: number;
  people_fully_vaccinated?: number;
  people_fully_vaccinated_per_hundred?: number;
  daily_vaccinations_raw?: number;
}

export interface Obiectiv {
  xid: string;
  name: string;
  dist: number;
  rate: number;
  wikidata: string;
  kinds: string;
  // point: Point;
}

export class Country {
  country: string;
  iso_code: string;
  data: Datum[];
  data2: Datum;
  rataVaccinare: string;
  rataVaccinareLaPerioadaSelectata: string;
  risc: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  slideOpts = {
    pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
    threshold: 35,
    // navigation: {
    //   nextEl: '.swiper-button-next',
    //   prevEl: '.swiper-button-prev',
    // },
    // scrollbar: {
    //   el: '.swiper-scrollbar',
    //   draggable: true,
    // },
    allowTouchMove: false,
    loop: true,
    paralax: true,
    effect: 'flip'
  };
  @ViewChild('Slider', { static: false }) Slider: IonSlides;
  DeLa = this.FormateazaData(new Date());
  PanaLa = this.FormateazaData(new Date());
  SlideAnimation = true;
  OpenTripApiKey = '5ae2e3f221c38a28845f05b602f751128231d06e18baa230eb4c5314';
  Destinatie = '';
  ListaTari: Country[] = [];
  ListaTariFiltrate: Country[] = [];
  ListaTariCuPopulatie: [] = [];
  FiltruTara: Country = new Country();
  ListaObiective: Obiectiv[] = [];
  ToateTarile = false;


  constructor(public toastController: ToastController,) { }

  ngOnInit() {
    setTimeout(() => {
      // this.FiltruTara = 'ro'
    }, 500);
    this.DescarcaListaTariCuVaccin();
    this.DescarcaListaTariCuPopulatie();
    setInterval(() => {
      // this.Slider.lockSwipes(false);
      if (this.SlideAnimation) {
        this.Slider.slideNext();
      }
      // this.Slider.lockSwipes(true);
    }, 5000);
  }

  FormateazaData(NewDate: Date): string {
    if (NewDate === null) {
      return '';
    }
    let data = '';
    data = NewDate.getFullYear() + '-';
    if (Number(NewDate.getMonth() + 1) < 10) {
      data += '0' + (NewDate.getMonth() + 1) + '-';
    } else {
      data += (NewDate.getMonth() + 1) + '-';
    }
    if (Number(NewDate.getDate()) < 10) {
      data += '0' + NewDate.getDate();
    } else {
      data += NewDate.getDate();
    }
    console.log(data);
    return data;

  }

  Cauta() {
    if (this.Destinatie.length < 3) {
      this.ListaObiective = [];
      return;
    }
    const requestOptions = {
      method: 'GET'
    };
    let Zona = new GeoZone();
    fetch(`https://api.opentripmap.com/0.1/en/places/geoname?apikey=${this.OpenTripApiKey}&name=${this.Destinatie}`, requestOptions)
      .then(response => response.text())
      .then(result => {
        Zona = JSON.parse(result)
        fetch(`https://api.opentripmap.com/0.1/en/places/radius?apikey=${this.OpenTripApiKey}&radius=1000&limit=200&offset=0&lon=${Zona.lon}&lat=${Zona.lat}&format=json`, requestOptions)
          .then(response => response.text())
          .then(result => {
            this.ListaObiective = JSON.parse(result);
          })
          .catch(error => console.log('error', error));
      })
      .catch(error => console.log('error', error));
  }


  DescarcaListaTariCuPopulatie() {
    const requestOptions = {
      method: 'GET'
    };
    return fetch(`https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json`, requestOptions)
      .then(response => response.text())
      .then(result => {
        this.ListaTariCuPopulatie = JSON.parse(result);
      })
      .catch(error => console.log('error', error));
  }

  DescarcaListaTariCuVaccin() {
    const requestOptions = {
      method: 'GET'
    };
    fetch(`https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json`, requestOptions)
      .then(response => response.text())
      .then(result => {
        this.ListaTari = JSON.parse(result).map((tara: Country) => {
          // preiau doar cele mai recente date 
          tara.data2 = tara.data[tara.data.length - 1];
          tara.data = [];
          return tara;
        });
        console.log(this.ListaTari);

      })
      .catch(error => console.log('error', error));
  }

  async filterList(evt) {
    setTimeout(() => {
      if (evt === undefined) {
        // toate
        if (this.ToateTarile) {
          this.ListaTariFiltrate = this.ListaTari;
        } else {
          this.ListaTariFiltrate = [];
        }
        return;
      } else {
      this.ListaTariFiltrate = this.ListaTari;
      const searchTerm = evt.srcElement.value;
      if (searchTerm === '') {
        this.ListaTariFiltrate = [];
        return;
      }

      if (!searchTerm) {
        return;
      }

      this.ListaTariFiltrate = this.ListaTari.filter((tara: Country) => {
        if (tara.country && searchTerm) {
          if (tara.country.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
        }
      });
    }
    }, 0);
    setTimeout(() => {
      this.CalculeazaRatele();
    }, 100);
  }

  SelecteazaTara(tara) {
    this.FiltruTara.country = tara;
    setTimeout(() => {
      this.ListaTariFiltrate = [];
    }, 50);
  }

  DiferentaZile(a: Date, b: Date) {
    if (a > b) {
      return;
    }
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  showToast(mesaj: string, timp?: number, poz?: any) {
    let pozitie: any = 'bottom';
    if (poz !== undefined) {
      pozitie = poz;
    }
    if (timp === undefined) {
      timp = 2000;
    }
    const toast = this.toastController.create({
      message: mesaj,
      duration: timp,
      position: pozitie,
      buttons: [
        {
          side: 'end',
          text: '   OK   ',
        }
      ]
    }).then((toastData) => {
      toastData.present();
    });
  }

  CalculeazaRatele() {
    setTimeout(() => {
      if (new Date(this.DeLa) > new Date(this.PanaLa)) {
        this.showToast('Data de început trebuie să fie mai mică decât data de sfârșit!');
        return;
      }
      this.ListaTariFiltrate.forEach((tara: Country) => {
        this.ListaTariCuPopulatie.find((taraPop) => {
          if (taraPop['country'] === tara.country) {
            tara.rataVaccinare = (tara.data2.people_vaccinated * 100 / Number(taraPop['population'])).toPrecision(2);
            const rata1 = Number(tara.rataVaccinare);
            if (isNaN(Number(tara.rataVaccinare))) {
              tara.rataVaccinare = '-';
            } else {
              tara.rataVaccinare += ' %';
            }
            const estimareNrZile = this.DiferentaZile(new Date(this.DeLa), new Date(this.PanaLa)) / 2;
            const rata2 = rata1 + (tara.data2.daily_vaccinations * estimareNrZile * 100 / Number(taraPop['population']));
            if (isNaN(rata2)) {
              tara.rataVaccinareLaPerioadaSelectata = '-';
            } else {
              const x = rata2;
              if (x > 70) {
                tara.risc = 'scăzut';
              } else if (x > 35) {
                tara.risc = 'mediu';
              } else {
                tara.risc = 'ridicat';
              }
              if (rata2 > 100) {
                tara.rataVaccinareLaPerioadaSelectata = '100 %';
              } else {
                tara.rataVaccinareLaPerioadaSelectata = rata2.toPrecision(2) + ' %';
              }
            }
            tara.data = [];
            return tara;
          }
        });
      });
    }, 100);
  }

  booking(){
    const data1 = new Date(this.DeLa);
    const data2 = new Date(this.PanaLa);
    const Url = `https://www.booking.com/searchresults.ro.html?sb=1&sb_lp=1&src=index&src_elem=sb&ss=${this.Destinatie}&checkin_year=${data1.getFullYear()}&checkin_month=${data1.getMonth() + 1}&checkin_monthday=${data1.getDate()}&checkout_year=${data2.getFullYear()}&checkout_month=${data2.getMonth() + 1}&checkout_monthday=${data2.getDate()}&group_adults=2&group_children=0&no_rooms=1&from_sf=1`
        window.open(Url, '_target');
  }

}
