import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function test() {
  const content = await readFile(join(__dirname, '..', 'resources', 'AMC_8_2020_Problems.md'), 'utf-8');
  
  // Test different regex patterns
  const patterns = [
    /!\[([^\]]*)\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g,
    /!\[[^\]]*\]\(https:\/\/latex\.artofproblemsolving\.com[^)]+\)/g,
    /https:\/\/latex\.artofproblemsolving\.com[^\s)]+/g
  ];
  
  patterns.forEach((pattern, index) => {
    const matches = Array.from(content.matchAll(pattern));
    console.log(`Pattern ${index + 1}: Found ${matches.length} matches`);
    if (matches.length > 0) {
      console.log('First match:', matches[0][0].substring(0, 100) + '...');
    }
  });
  
  // Check if there are any URLs at all
  if (content.includes('https://latex.artofproblemsolving.com')) {
    console.log('\nFile contains artofproblemsolving URLs');
    
    // Find the first occurrence
    const index = content.indexOf('https://latex.artofproblemsolving.com');
    console.log('Context around first URL:');
    console.log(content.substring(Math.max(0, index - 50), index + 100));
  }
}

test().catch(console.error);