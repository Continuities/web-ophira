import AudioPlayer from './audio-player.js';
import SliderBar from './slider-bar.js';
import SpinDial from './spin-dial.js';

customElements.define('slider-bar', SliderBar);
customElements.define('spin-dial', SpinDial);

const player = AudioPlayer();

const bar = document.querySelector('slider-bar');
bar.addEventListener('change', e => {
  console.log('SLIDER', e.target.value);
  player.changeSpeed(e.target.value);
});

const dial = document.querySelector('spin-dial');
dial.addEventListener('change', e => {
  console.log('DIAL', e.target.value);
});
