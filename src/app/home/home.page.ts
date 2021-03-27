import { Component, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

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
    allowTouchMove:false,
    loop:true,
    paralax:true,
    effect:'flip'
  };
  @ViewChild('Slider', { static: false }) Slider:IonSlides;
  SlideAnimation = true;

  constructor() {}

  ngOnInit(){
    setTimeout(() => {
      // this.Slider.lockSwipes(true);
    }, 500);
    setInterval(() => {
      // this.Slider.lockSwipes(false);
      if (this.SlideAnimation) {
        this.Slider.slideNext();
      }
      // this.Slider.lockSwipes(true);
    }, 5000);
  }
}
