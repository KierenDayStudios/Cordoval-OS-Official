const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('components').filter(f => f.endsWith('.tsx'));
let patched = 0;

for (const file of files) {
  const filePath = path.join('components', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('localStorage.setItem(\'cordoval_')) {
    // We can comment out lines that contain localStorage.setItem('cordoval_
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      if (line.includes('localStorage.setItem(\'cordoval_')) {
        return '// ' + line; // Comment out the auto-save
      }
      return line;
    });
    
    fs.writeFileSync(filePath, newLines.join('\n'));
    patched++;
    console.log('Patched setItem in', file);
  }
}
console.log(`Patched ${patched} files`);
