/**
 * Reads version package.json
 */
import { sync } from 'read-pkg-up';

const result = sync({ cwd: __dirname });
export const version: string = result ? result.package.version : 'unknown';
