/**
 * CLI config utils
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = '.rtvrc';

export const initConfig = () => {
  // config defaults are in rtv-client: /packages/client/src/config.js
  return Object.assign({}, readFromDefaultFile(), readFromEnv());
};

const readFromDefaultFile = () => {
  const configFiles = getAvailableConfigFiles();
  return configFiles.length > 0 ? readFromFile(configFiles[0]) : null;
};

const readFromEnv = () => {
  const apiUrl = process.env.RTV_API_URL;
  return apiUrl ? { apiUrl } : null;
};

export const readFromFile = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const getAvailableConfigFiles = () => {
  const dirs = [process.cwd(), os.homedir()];
  const filePaths: string[] = [];

  dirs.forEach((dir) => {
    const filePath = path.join(dir, CONFIG_FILE);
    if (fs.existsSync(filePath)) {
      filePaths.push(filePath);
    }
  });

  return filePaths;
};
