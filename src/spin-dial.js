import { clamp } from './util.js';

const tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    *, *::before, *::after: {
      box-sizing: border-box;
    }
    .wrapper {
      position: relative;
      margin: 50px;
      display: inline-block;
    }
    .labels, .dial {
      height: 100px;
      width: 100px;
    }
    .labels {
      padding: 0;
      margin: 0;
    }
    .dial {
      cursor: pointer;
      position: absolute;
      border: 1px solid black;
      border-radius: 50%;
      display: block;
      top: 0;
      left: 0;
    }
    .dial::before {
      pointer-events: none;
      content: '';
      position: absolute;
      width: 40px;
      height: 10px;
      border: 1px solid black;
      top: 50%;
      margin-top: -5px;
      left: -10px;
    }
    .dial-value {
      height: 12px;
      font-size: 12px;
      list-style: none;
      position: absolute;
      width: 100%;
      top: 50%;
      margin-top: -6px;
    }
    .value-label {
      cursor: pointer;
      position: absolute;
      right: calc(100% + 15px);
      user-select: none;
    }
  </style>
  <div class='wrapper'>
    <ol class='labels'></ol>
    <div class='dial'></div>
  </div>
`;

const BY_VALUE = Symbol('BY VALUE');

const rotRegex = /rotate\(([\d\.]+)deg\)/;

const updateDial = (dial, value) => {
  const data = dial[BY_VALUE][value];
  const rot = data ? data.rot : 0;
  dial.shadowRoot.querySelector('.dial').style.transform = `rotate(${rot}deg)`;
};

const getAngle = (offsetX, offsetY, center) => {
  const x = center.x - offsetX, y = center.y - offsetY;
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  return angle < 0 ? 360 + angle : angle;
};

const getRotation = dial => parseFloat(rotRegex.exec(dial.style.transform)[1]);

const getDialCenter = dial => {
  const dialPos = dial.getBoundingClientRect();
  return {
    x: dialPos.left + dialPos.width / 2,
    y: dialPos.top + dialPos.height / 2
  };
}

class SpinDial extends HTMLElement {
  constructor() {
    super();

    this[BY_VALUE] = {};

    const els = [...this.querySelectorAll('dial-value')];
    const space = 360 / els.length;
    const values = els
      .map((v, i) => ({ 
        value: v.getAttribute('value'),
        label: v.innerText,
        rot: space * i
      }));
    const fragment = document.createDocumentFragment();
    values.forEach((v, i) => {
      const el = document.createElement('li');
      el.className = 'dial-value';
      el.innerHTML = `<span class='value-label' style='transform:rotate(${v.rot > 90 && v.rot < 270 ? 180 : 0}deg)'>${v.label}</span>`;
      el.style.transform = `rotate(${v.rot}deg)`;
      el.querySelector('.value-label').addEventListener('click', () => {
        this.value = v.value;
      });
      fragment.appendChild(el);
      this[BY_VALUE][v.value] = v;
    });

    this.innerHTML = '';
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    shadowRoot.querySelector('.labels').appendChild(fragment);
    const value = parseFloat(this.getAttribute('value')) || 0;
    updateDial(this, value);

    const dial = shadowRoot.querySelector('.dial');
    const radius = dial.clientWidth / 2;
    let lastRot = null;

    const onMove = e => {
      if (lastRot == null) {
        return;
      }
      const mouseRot = getAngle(e.clientX, e.clientY, getDialCenter(dial));
      const delta = mouseRot - lastRot;
      const oldRot = getRotation(dial);
      const newRot = (oldRot + delta) % 360;
      lastRot = mouseRot;
      dial.style.transform = `rotate(${newRot + (newRot < 0 ? 360 : 0)}deg)`;
    };
    const onUp = () => {
      lastRot = null;
      const rot = getRotation(dial);
      const newValue = values.reduce((acc, curr) => {
        const currDiff = curr.rot !== 0 
          ? Math.abs(curr.rot - rot) 
          : Math.min(Math.abs(360 - rot), rot);
        const accDiff = acc.rot !== 0 
          ? Math.abs(acc.rot - rot) 
          : Math.min(Math.abs(360 - rot), rot);
        return currDiff < accDiff ? curr : acc;
      });
      this.value = newValue.value;
      document.body.removeEventListener('mousemove', onMove);
      document.body.removeEventListener('mouseup', onUp);
    };
    dial.addEventListener('mousedown', e => {
      lastRot = getAngle(e.clientX, e.clientY, getDialCenter(dial));
      document.body.addEventListener('mousemove', onMove);
      document.body.addEventListener('mouseup', onUp);
    });

  }

  static get observedAttributes() {
    return [ 'value' ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value') {
      return;
    }
    updateDial(this, newValue);
    if (newValue !== oldValue) {
      this.dispatchEvent(new Event('change'));
    }
  }

  get value() {
    return parseFloat(this.getAttribute('value')) || 0;
  }

  set value(newValue) {
    this.setAttribute('value', newValue);
  }
};

export default SpinDial;
