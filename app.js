import * as PIXI from 'pixi.js';
import fit from 'math-fit';
import gsap from 'gsap';

import t1 from './1.png';
import t2 from './2.png';
import t3 from './3.jpg';
import t4 from './4.jpg';
import t5 from './5.jpg';
import t6 from './6.jpg';
import t7 from './7.png';
import disp from './displacement.jpg';


// Preload array of images with callback
function loadImages(paths, whenLoaded) {
  var imgs = [];
  paths.forEach(function (path) {
    var img = new Image;
    img.onload = function () {
      imgs.push(img);
      if (imgs.length == paths.length) whenLoaded(imgs);
    }
    img.src = path;
  });
}

class Sketch {
  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: 0x1099bb,
      resizeTo: window
    });
    document.body.appendChild(this.app.view);
    this.margin = 50;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.width = (window.innerWidth - 2 * this.margin) / 3;
    this.height = window.innerHeight * 0.8;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
    this.images = [t1, t2, t3, t4, t5, t6, t7];
    this.WHOLEWIDTH = this.images.length * (this.width + this.margin);

    loadImages(this.images, (images) => {
      this.loadedImages = images;
      this.add();
      this.render();
      this.scrollEvent();
      this.addFilter();
    })
  }

  scrollEvent() {
    document.addEventListener('mousewheel', (e) => {
      this.scrollTarget = e.wheelDelta / 3;
    });
  }

  addFilter() {
    this.displacementSprite = PIXI.Sprite.from(disp);
    this.app.stage.addChild(this.displacementSprite);

    let target = {
      w: 512,
      h: 512,
    };

    let parent = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    let cover = fit(target, parent);

    this.displacementSprite.position.set(cover.left, cover.top);
    this.displacementSprite.scale.set(cover.scale, cover.scale);

    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;
    this.container.filters = [this.displacementFilter];
  }

  add() {
    let parent = {
      w: this.width,
      h: this.height,
    };
    this.thumbs = [];
    this.loadedImages.forEach((img, i) => {
      let texture = PIXI.Texture.from(img)
      let sprite = new PIXI.Sprite(texture);
      let container = new PIXI.Container();
      let spriteContainer = new PIXI.Container();

      let mask = new PIXI.Sprite(PIXI.Texture.WHITE)
      mask.width = this.width;
      mask.height = this.height;

      sprite.mask = mask;

      sprite.anchor.set(0.5);
      sprite.position.set(
        sprite.texture.orig.width / 2,
        sprite.texture.orig.height / 2,
      );

      let image = {
        w: sprite.texture.orig.width,
        h: sprite.texture.orig.height,
      };

      let cover = fit(image, parent);
      spriteContainer.position.set(cover.left, cover.top);
      spriteContainer.scale.set(cover.scale, cover.scale);

      container.x = (this.margin + this.width) * i;
      container.y = this.height / 10;

      spriteContainer.addChild(sprite);
      container.interactive = true;
      container.on('mouseover', this.mouseOn)
      container.on('mouseout', this.mouseOut)
      container.addChild(spriteContainer);
      container.addChild(mask);
      this.container.addChild(container);
      this.thumbs.push(container);
    });
  }

  mouseOn(e) {
    let el = e.target.children[0].children[0];

    gsap.to(el.scale, {
      duration: .69,
      x: 1.1,
      y: 1.1,
    })
  }

  mouseOut(e) {
    let el = e.currentTarget.children[0].children[0];

    gsap.to(el.scale, {
      duration: .69,
      x: 1,
      y: 1,
    })
  }

  calcPos(src, pos) {
    let temp = (src + pos + this.WHOLEWIDTH + this.width + this.margin) % this.WHOLEWIDTH - this.width - this.margin;
    return temp;
  }

  render() {
    this.app.ticker.add(() => {
      this.app.renderer.render(this.container);
      this.direction = this.scroll > 0 ? -1 : 1;
      this.scroll -= (this.scroll - this.scrollTarget) * 0.1;
      this.scroll *= 0.9;
      this.thumbs.forEach(th => {
        th.position.x = this.calcPos(this.scroll, th.position.x);
      });
      this.displacementFilter.scale.x = 3 * this.direction * Math.abs(this.scroll);
    });
  }
}

new Sketch();
