import SliderBar from './slider-bar.js';

customElements.define('slider-bar', SliderBar);

const bar = document.querySelector('slider-bar');
console.log(bar);
bar.addEventListener('change', e => {
  console.log(e.target.value);
});
