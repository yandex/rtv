import { homedir, tmpdir } from 'os';

export type Room = {
  url: string;
  label: string;
};

export interface RtvServerConfig extends Record<string, unknown> {
  port: number;
  httpsPort: number | null;
  streamsPort: number | null;
  httpsCert: string | null;
  httpsKey: string | null;
  sdbPath: string;
  tizenPath: string;
  aresPath: string;
  workDirPath: string;
  tvIsOccupiedTimeout: number;
  rtvDataPath: string;
  externalRoomsUrl?: string;
  rooms?: Room[];
  webosAccountLogin?: string;
  webosAccountPassword?: string;
}

export const defaults: RtvServerConfig = {
  port: 3000,
  httpsPort: null,
  streamsPort: 8081,
  httpsCert: null,
  httpsKey: null,
  sdbPath: `${homedir}/tizen-studio/tools`,
  tizenPath: `${homedir}/tizen-studio/tools/ide/bin`,
  aresPath: `${homedir}/webOS_TV_SDK/CLI/bin`,
  workDirPath: `${tmpdir()}/rtv-temp`,
  tvIsOccupiedTimeout: 5 * 60 * 1000,
  rtvDataPath: `${homedir}/rtv-data`,
};
