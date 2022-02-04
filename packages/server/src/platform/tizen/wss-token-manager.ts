/**
 * Store for tokens, which are used for wss-connections in Tizen 3-4
 */
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import Loggee from 'loggee';

const logger = Loggee.create('wss-token-manager');

const WSS_TOKENS_FILE = path.join(os.homedir(), '.rtv-wss-tokens');
let connectionTokens: Record<string, string> = {};

export function init() {
  try {
    fs.ensureFileSync(WSS_TOKENS_FILE);
    const data = fs.readFileSync(WSS_TOKENS_FILE, 'utf8');
    if (data && data.length) {
      connectionTokens = JSON.parse(data);
    }
  } catch (err) {
    logger.error(err);
  }
}

export function get(ip: string) {
  return connectionTokens[ip] || '';
}

export function set(ip: string, token: string) {
  connectionTokens[ip] = token;
  try {
    fs.writeFileSync(WSS_TOKENS_FILE, JSON.stringify(connectionTokens));
  } catch (err) {
    logger.error(err);
  }
}
