const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.html')) processFile(full);
  }
}

function backup(file) {
  const bak = file + '.bak_at';
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // convert <ng-container *ngIf="expr"> to @if (expr) {
  content = content.replace(/<ng-container\s+\*ngIf\s*=\s*"([^"]+)"\s*>/g, (m, expr) => {
    // handle "expr as var"
    const asMatch = expr.match(/([^\s]+)\s+as\s+([A-Za-z0-9_$]+)/);
    if (asMatch) {
      return `@if (${asMatch[1].trim()}; as ${asMatch[2].trim()}) {`;
    }
    return `@if (${expr.trim()}) {`;
  });

  // convert <ng-container *ngFor="let item of list"> to @for (item of list) {
  content = content.replace(/<ng-container\s+\*ngFor\s*=\s*"let\s+([A-Za-z0-9_$]+)\s+of\s+([^"]+)"\s*>/g, (m, item, list) => {
    return `@for (${item.trim()} of ${list.trim()}) {`;
  });

  // replace closing </ng-container> on its own line with }
  content = content.replace(/^\s*<\/ng-container>\s*$/gm, '}');

  if (content !== original) {
    backup(file);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Reversed:', path.relative(root, file));
  }
}

walk(src);
console.log('\nReverse transform complete. Backups saved with .bak_at suffix.');
