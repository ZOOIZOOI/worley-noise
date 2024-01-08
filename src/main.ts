import './style.css';
import { Pane } from 'tweakpane';
import { distance2D, distanceManhattan, range } from '@ZOOIZOOI/utils';
import { createNoise3D } from 'simplex-noise';

// Constants
const SIZE = 150;
const CELLS = 4;
const CELL_SIZE = SIZE / CELLS;

// Settings
const settings = {
  N: 0,
  speed: 0.04,
  colorRange: { x: 0, y: 60 },
  isPaused: true,
  drawPoints: false,
  drawGrid: false,
  distort: false,
  hsl: false,
  manhattan: true,
  fill: true,
}

// Setup context
const canvasElement = document.querySelector('.canvas') as HTMLCanvasElement;
canvasElement.width = SIZE;
canvasElement.height = SIZE;
const context = canvasElement.getContext('2d') as CanvasRenderingContext2D;

// Setup Tweakpane
const pane = new Pane();
pane.addBinding(settings, 'N', {
  step: 1,
  min: 0,
});
pane.addBinding(settings, 'speed', {
  step: 0.001,
});
pane.addBinding(settings, 'colorRange', {
  x: { step: 0.1 },
  y: { step: 0.1 }
});
pane.addBinding(settings, 'isPaused');
pane.addBinding(settings, 'drawPoints');
pane.addBinding(settings, 'drawGrid');
pane.addBinding(settings, 'distort');
pane.addBinding(settings, 'hsl');
pane.addBinding(settings, 'manhattan');
pane.addBinding(settings, 'fill');

// Generate random points
const points: any[] = [];
const halfCellSize = CELL_SIZE * 0.5;
for (let i = 0; i < CELLS; i++) {
  for (let j = 0; j < CELLS; j++) {
    // const x = i * CELL_SIZE + CELL_SIZE * Math.random();
    // const y = j * CELL_SIZE + CELL_SIZE * Math.random();
    const x = i * CELL_SIZE + halfCellSize;
    const y = j * CELL_SIZE + halfCellSize;
    // const z = SIZE * 0.5;
    const z = Math.random() * SIZE;
    const color = palette(Math.random() * 0.5, {r: 0.5, g: 0.5, b: 0.5}, {r: 0.5, g: 0.5, b: 0.5},{r: 1.0, g: 1.0, b: 1.0},{r: 0.0, g: 0.1, b: 0.2});
    points.push({
      origin: {x, y, z},
      current: {x: 0, y: 0, z: 0},
      rotation: {x: Math.random(), y: Math.random(), z: Math.random()},
      timeOffset: Math.random() * 100,
      color: {r: color.r * 255, g: color.g * 255, b: color.b * 255}
    });
  }
}

// Draw 
let time = 0;
let distances = [];

// Noise
const noise3D = createNoise3D();

function draw() {
  context.clearRect(0, 0, SIZE, SIZE);

  // Update points position
  for (let i = 0, len = points.length; i < len; i++) {
    const point = points[i];
    const { origin, rotation, timeOffset } = point;

    point.current.x = origin.x + CELL_SIZE * 0.4 * Math.sin((time + timeOffset) * rotation.x);
    point.current.y = origin.y + CELL_SIZE * 0.4 * Math.cos((time + timeOffset) * rotation.y);
    // point.current.x = origin.x;
    // point.current.y = origin.y;
    // point.current.z = origin.z + CELL_SIZE * 0.5 * Math.cos((time + timeOffset) * rotation.y);
  }

  // Loop through all pixels
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      distances = [];

      // Calc distances
      for (let i = 0, len = points.length; i < len; i++) {
        const current = points[i].current;
        const dist = settings.manhattan ? distanceManhattan({x, y}, current) : distance2D({x, y}, current);
        distances.push({dist, color: points[i].color});
      }

      // Sort the distances
      distances.sort((a, b) => {
        if (a.dist < b.dist) {
          return -1;
        } else if (b.dist > a.dist) {
          return 1;
        }
        return 0;
      });

      // Draw the pixels
      const distance = distances[settings.N].dist;

      let newDistance = distance;
      if (settings.distort) {
        const noiseScale = 0.01;
        const noise = noise3D(x * noiseScale, y * noiseScale, distance * 0.3);
        newDistance += noise * 6;
      }
      
      if (settings.fill) {
        const color = distances[settings.N].color;
        context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      } else {
        const color = range(newDistance, settings.colorRange.x, settings.colorRange.y, 0, 255);
        context.fillStyle = settings.hsl ? `hsl(${color}, 100%, 50%)` : `rgb(${color}, ${color}, ${color})`;
      }
      
      context.fillRect(x, y, 1, 1);

      // const distance2 = distances[settings.N + 1];
      // const a = Math.abs(distance2 - distance);
      // if (a > 0 && a < 2) {
      //   context.globalAlpha = 1;
      //   context.fillStyle = `rgb(255, 255, 255)`;
      //   context.fillRect(x, y, 1, 1);
      //   context.globalAlpha = 1;
      // }
    }
  }

  // Draw points
  if (settings.drawPoints) {
    for (let i = 0, len = points.length; i < len; i++) {
      const point = points[i];
      context.fillStyle = 'red';
      context.fillRect(point.current.x, point.current.y, 1, 1)
    }
  }

  // Draw grid
  if (settings.drawGrid) {
    for (let i = 1; i < CELLS; i++) {
        context.fillStyle = 'black';
        // Rows
        context.fillRect(0, i * CELL_SIZE, SIZE, 1);
        // Columns
        context.fillRect(i * CELL_SIZE, 0, 1, SIZE);
    }
  }
  
  // Update counter
  if (!settings.isPaused) time += settings.speed;
}

// https://iquilezles.org/articles/palettes/
function palette(t: number, a: {r: number, g: number, b: number}, b: {r: number, g: number, b: number}, c: {r: number, g: number, b: number}, d: {r: number, g: number, b: number}) {
  return {
    r: a.r + b.r * Math.cos(6.28318 * (c.r * t + d.r)),
    g: a.g + b.g * Math.cos(6.28318 * (c.g * t + d.g)),
    b: a.b + b.b * Math.cos(6.28318 * (c.b * t + d.b))
  };
}

// Ticker
function tick() {
  draw();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
