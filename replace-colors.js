const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [...walk('components'), ...walk('app')];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replacements
  content = content.replace(/border-white\/10/g, 'border-glass-border');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-glass-bg');
  content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-glass-bg');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-glass-bg');
  content = content.replace(/bg-white\/5/g, 'bg-glass-bg');
  content = content.replace(/border-white\/8/g, 'border-glass-border');
  
  // Specific navbar ones
  content = content.replace(/bg-black\/50/g, 'bg-glass-bg dark:bg-black/50');
  content = content.replace(/bg-black\/85/g, 'bg-glass-bg dark:bg-black/85');
  content = content.replace(/hover:bg-white\/\[0\.08\]/g, 'hover:bg-glass-border'); // slightly brighter
  
  // Specific gradients
  content = content.replace(/bg-\[linear-gradient\(135deg,rgba\(255,122,0,0\.14\),rgba\(255,255,255,0\.03\),rgba\(10,10,10,0\.65\)\)\]/g, 'bg-glass-bg dark:bg-[linear-gradient(135deg,rgba(255,122,0,0.14),rgba(255,255,255,0.03),rgba(10,10,10,0.65))]');
  content = content.replace(/bg-\[linear-gradient\(180deg,rgba\(255,255,255,0\.04\),rgba\(255,255,255,0\.015\)\)\]/g, 'bg-glass-bg dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]');
  content = content.replace(/bg-\[linear-gradient\(180deg,rgba\(255,255,255,0\.04\),rgba\(255,255,255,0\.02\)\)\]/g, 'bg-glass-bg dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]');
  
  // Inputs
  content = content.replace(/bg-black\/20/g, 'bg-glass-bg dark:bg-black/20');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
