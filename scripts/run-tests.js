const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { run } = require('node:test');
const { spec } = require('node:test/reporters');

// Register TypeScript on-the-fly compiler hook for .ts and .tsx files
function compileTypeScript(module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(content, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  });
  module._compile(compiled.outputText, filename);
}

require.extensions['.ts'] = compileTypeScript;
require.extensions['.tsx'] = compileTypeScript;

// Discover all test files in tests/ directory
const testsDir = path.resolve(__dirname, '../tests');
const testFiles = [];

function findTestFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTestFiles(fullPath);
    } else if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.js')) {
      testFiles.push(fullPath);
    }
  }
}

if (fs.existsSync(testsDir)) {
  findTestFiles(testsDir);
}

if (testFiles.length === 0) {
  console.log('No test files found in tests/');
  process.exit(0);
}

console.log(`Running AntiDopX 2.0 Test Suite (${testFiles.length} test files discovered)...\n`);

// Require all test files in-process to register node:test suites through the TS hook
for (const file of testFiles) {
  require(file);
}

// Pipe the default test stream to spec reporter
run()
  .on('test:fail', () => {
    process.exitCode = 1;
  })
  .compose(new spec())
  .pipe(process.stdout);
