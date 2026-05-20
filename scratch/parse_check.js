const fs = require('fs');
const parser = require('@babel/parser');

try {
  const code = fs.readFileSync('src/App.js', 'utf8');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });
  console.log('Successfully parsed!');
} catch (e) {
  console.error('Parse Error:', e.message);
  if (e.loc) {
    console.error('Location:', e.loc);
    const lines = fs.readFileSync('src/App.js', 'utf8').split('\n');
    const start = Math.max(0, e.loc.line - 5);
    const end = Math.min(lines.length, e.loc.line + 5);
    for (let i = start; i < end; i++) {
      console.error(`${i + 1}: ${lines[i]}`);
    }
  }
}
