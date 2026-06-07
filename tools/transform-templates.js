const path = require('path');

const root = path.resolve(__dirname, '..');

console.log(
  `Skipping template transform in ${root}: Angular handles @if/@for templates natively.`,
);
