// Standalone test for currency function
const ts = require('typescript');
const fs = require('fs');

// Read and transpile the TypeScript file
const source = fs.readFileSync('src/utils/currency.ts', 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2015 }
});

// Write to temp file and require it
fs.writeFileSync('temp_currency.js', result.outputText);
const { priceFromCost } = require('./temp_currency.js');

// Test the function
console.log('Testing priceFromCost(0.01, 25, 30):');
const price = priceFromCost(0.01, 25, 30);
console.log('Result:', price);
console.log('Type:', typeof price);
console.log('Is greater than 0?', price > 0);
console.log('Expected: 0.01');
console.log('Test:', price === 0.01 ? 'PASS ✓' : 'FAIL ✗');

// Cleanup
fs.unlinkSync('temp_currency.js');
