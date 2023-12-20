/**
 * Worley noise CPU
 * 
 * Resources
 * - https://www.youtube.com/watch?v=4066MndcyCk 
 * - https://en.wikipedia.org/wiki/Worley_noise
 * - https://www.rhythmiccanvas.com/research/papers/worley.pdf
 * - https://thebookofshaders.com/12/
 */

import './style.css';
import { Pane } from 'tweakpane';

// Constants
const SIZE = 150;
const POINTS_AMOUNT = 10;

// Settings
const settings = {
  N: 1,
  speed: 0.02,
  colorRange: { x: 0, y: 120 },
  isPaused: false,
}

// Setup context
const canvasElement = document.querySelector('.canvas');
canvasElement.width = SIZE;
canvasElement.height = SIZE;
const context = canvasElement.getContext('2d');

// Setup Tweakpane
const pane = new Pane();
pane.addBinding(settings, 'N', {
  step: 1,
  min: 0,
  max: POINTS_AMOUNT - 1,
});
pane.addBinding(settings, 'speed', {
  step: 0.001,
});
pane.addBinding(settings, 'colorRange', {
  x: { step: 0.1 },
  y: { step: 0.1 }
});
pane.addBinding(settings, 'isPaused');

// Generate random points
const points = [];
for (let i = 0; i < POINTS_AMOUNT; i++) {
  const x = Math.random() * SIZE;
  const y = Math.random() * SIZE;
  const z = Math.random() * SIZE;
  points.push({x, y, z});
}

// Draw 
let count = 0;
let distances = [];
function draw() {
  // Fake Z
  const z = ((Math.sin(count) + 1) * 0.5) * SIZE;

  // Loop through all pixels
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      distances = [];

      // Calc distances
      for (let i = 0, len = points.length; i < len; i++) {
          distances.push(distance3D({x, y, z}, points[i]));  
      }

      // Sort the distances
      distances.sort((a, b) => {
        if (a < b) {
          return -1;
        } else if (b > a) {
          return 1;
        }
        return 0;
      });

      // Draw the pixels
      const color = map(distances[settings.N], settings.colorRange.x, settings.colorRange.y, 255, 0);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(x, y, 1, 1);
    }
  }
  
  // Update counter
  if (!settings.isPaused) count += settings.speed;
}

// Utils
function distance3D(point1, point2) {
  const a = point2.x - point1.x;
  const b = point2.y - point1.y;
  const c = point2.z - point1.z;
  return Math.sqrt(a * a + b * b + c * c);
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Ticker
function tick() {
  draw();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
