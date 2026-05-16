#!/usr/bin/env node

/**
 * Fix _routes.json to ensure CSS and JS assets are served as static files
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const routesConfig = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/glenugie-booking/assets/*",
    "/glenugie-booking/_astro/*",
    "/glenugie-booking/BUILD_VERSION.txt",
    "/glenugie-booking/admin-direct-backup.html",
    "/glenugie-booking/favicon.ico",
    "/glenugie-booking/favicon.svg",
    "/glenugie-booking/logo.svg",
    "/glenugie-booking/robots.txt"
  ]
};

const routesPath = join(process.cwd(), 'dist', '_routes.json');

try {
  writeFileSync(routesPath, JSON.stringify(routesConfig, null, 2));
  console.log('✅ Fixed _routes.json to exclude assets folder');
} catch (error) {
  console.error('❌ Error fixing _routes.json:', error);
  process.exit(1);
}
