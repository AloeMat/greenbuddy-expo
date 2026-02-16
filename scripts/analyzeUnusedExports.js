#!/usr/bin/env node
/**
 * Analyze Unused Exports
 * Identifies unused service functions and exports for tree-shaking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICES_DIR = path.join(__dirname, '../services');
const SRC_DIR = path.join(__dirname, '../');

/**
 * Find all exported functions/constants from a service
 */
function getExportsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];

  // Match: export const name, export function name, export interface name, etc.
  const exportRegex = /export\s+(const|function|interface|class|enum|type)\s+(\w+)/g;
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push({
      name: match[2],
      type: match[1],
    });
  }

  return exports;
}

/**
 * Check if an export is used anywhere in the codebase
 */
function isExportUsed(exportName, servicePath) {
  const serviceName = path.basename(servicePath, '.ts');
  const searchPattern = `${serviceName}(\\s+|$|\\.)${exportName}`;

  try {
    const result = execSync(
      `grep -r "${exportName}" "${SRC_DIR}" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "${servicePath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Main analysis
 */
function analyzeUnusedExports() {
  console.log('🔍 Analyzing unused exports...\n');

  const services = fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.ts'));
  let totalUnused = 0;

  services.forEach(service => {
    const servicePath = path.join(SERVICES_DIR, service);
    const exports = getExportsFromFile(servicePath);

    const unused = exports.filter(exp => {
      // Skip common patterns that are always exported
      if (exp.type === 'interface' || exp.type === 'type') return false;
      if (exp.name === 'default') return false;

      return !isExportUsed(exp.name, servicePath);
    });

    if (unused.length > 0) {
      console.log(`📄 ${service}:`);
      unused.forEach(exp => {
        console.log(`   ❌ ${exp.type} ${exp.name} (unused)`);
        totalUnused++;
      });
      console.log('');
    }
  });

  console.log(`\n📊 Summary: Found ${totalUnused} unused exports`);
  console.log('💡 Tip: Consider removing unused exports to reduce bundle size\n');
}

analyzeUnusedExports();
