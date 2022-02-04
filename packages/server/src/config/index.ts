/**
 * Config
 */
import { readFileSync } from 'fs';
import { sync } from 'find-up';
import { omitBy, isUndefined } from 'lodash';
import { defaults, RtvServerConfig } from './defaults';

export const values: RtvServerConfig = { ...defaults };

export const merge = (customValues: Record<string, unknown>) => {
  Object.assign(values, omitBy(customValues, isUndefined));
};

const mergeFromFile = (filePath: string) => merge(JSON.parse(readFileSync(filePath, 'utf8')));

const mergeFromDefaultFile = () => {
  const filePath = sync(['.rtv-server'], { cwd: __dirname });
  if (filePath) {
    mergeFromFile(filePath);
  }
};

export const mergeFromEnv = () => {
  merge({
    port: process.env.PORT,
    streamsPort: process.env.STREAMS_PORT,
    webosAccountLogin: process.env.WEBOS_ACCOUNT_LOGIN,
    webosAccountPassword: process.env.WEBOS_ACCOUNT_PASSWORD,
  });
};

export const init = () => {
  mergeFromDefaultFile();
  mergeFromEnv();
};
