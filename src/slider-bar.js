
import { clamp, roundToPrecision } from './util.js';

const tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    .slider-bg {
      box-sizing: border-box;
      border: 1px solid black;
      border-radius: 10px;
      height: 10px;
      display: block;
      position: relative;
      margin: 20px 25px;
    }
    .slider-target {
      box-sizing: border-box;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      position: absolute;
      margin-left: -25px;
      margin-top: -21px;
      border: 1px solid black;
      cursor: pointer;
    }
  </style>
  <div class='slider-bg'>
    <div class='slider-target'></div>
  </div>
`;

const updateSlider = (slider, value) => {
  const target = slider.querySelector('.slider-target');
  target.style.left = `${value * 100}%`;
};

class SliderBar extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    const value = parseFloat(this.getAttribute('value')) || 0;
    updateSlider(shadowRoot, value);

    const target = shadowRoot.querySelector('.slider-target');
    const bg = shadowRoot.querySelector('.slider-bg');
    let lastPos = null;

    const onMove = e => {
      if (lastPos == null) {
        return;
      }
      const diffPx = e.clientX - lastPos;
      const diffValue = diffPx / bg.clientWidth;
      this.value += diffValue;
      lastPos = e.clientX;
    }

    const onUp = () => {
      lastPos = null;
      document.body.removeEventListener('mouseup', onUp);
      document.body.removeEventListener('mousemouse', onMove);
    }

    target.addEventListener('mousedown', e => {
      lastPos = e.clientX;
      document.body.addEventListener('mouseup', onUp);
      document.body.addEventListener('mousemove', onMove);
    });

    bg.addEventListener('mousedown', e => {
      if (e.target !== bg) {
        return;
      }
      this.value = e.offsetX / bg.clientWidth;
      lastPos = e.clientX;
      document.body.addEventListener('mouseup', onUp);
      document.body.addEventListener('mousemove', onMove);
    });

  }

  static get observedAttributes() {
    return [ 'value' ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value' || oldValue === newValue) {
      return;
    }
    updateSlider(this.shadowRoot, newValue);
    this.dispatchEvent(new Event('change'));
  }

  get value() {
    return parseFloat(this.getAttribute('value')) || 0;
  }

  set value(newValue) {
    this.setAttribute('value', roundToPrecision(clamp(newValue, 0, 1), 3));
  }
};

export default SliderBar;
