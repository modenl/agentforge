const testString = `![[asy] some code here [/asy]](https://latex.artofproblemsolving.com/test.png)`;

const patterns = [
  /!\[.*?\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g,
  /!\[[^\]]*\]\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g,
  /\]\((https:\/\/latex\.artofproblemsolving\.com[^)]+)\)/g
];

patterns.forEach((pattern, index) => {
  const matches = testString.match(pattern);
  console.log(`Pattern ${index + 1}:`, matches ? matches[0] : 'No match');
});