import packageJson from '@/package.json';

// We extract the version directly from package.json 
// to ensure there's a single source of truth.
// Next.js handles JSON imports out of the box.
export const APP_VERSION = packageJson.version || "0.1.0";
export const APP_VERSION_STRING = `v${APP_VERSION}`;
