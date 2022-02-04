/**
 * webOS TV
 */
import { execCmd, tryExecCmd } from '../../helpers/cli';
import { parseVersion } from '../../helpers';

const HD_CHIPSETS = ['A5LR', 'M2', 'M2R', 'M3', 'M3R'];
const TV_INFO_KEYS = ['boardType', 'firmwareVersion', 'modelName', 'sdkVersion', 'UHD', '_3d']; // http://webostv.developer.lge.com/api/webos-service-api/tv-device-information/?wos_flag=allFlipOpen#getSystemInfo
// TODO: update parsing new models
// Parsing model name (http://en.tab-tv.com/?page_id=7111)
const MODEL_NAME_REGEXPS = [
  /^([0-9][0-9])([SUELP])([MKJHFGBCNAWMSV])/i, // non OLED
  /^([0-9][0-9])([A-Z])([6-9])/, // 2016-2019 OLED models
];
const MODEL_YEAR_MAP: Record<string, string | undefined> = {
  M: '19',
  K: '18',
  J: '17',
  H: '16',
  F: '15',
  G: '15',
  B: '14',
  C: '14',
};
const DEV_MODE_NOT_ENABLED_ERROR = /(ECONNREFUSED)|(Please check the device IP address)/;
const SSH_KEY_NOT_LOADED_ERROR = /All configured authentication methods failed/;

export type WebosTvParams = {
  ip: string;
  webOSPassphrase?: string;
};

// http://webostv.developer.lge.com/discover/specifications/supported-app-resolution/
type AresDeviceInfo = {
  modelName?: string;
  firmwareVersion?: string;
  sdkVersion?: string;
  boardType?: string;
  otaId?: string;
  UHD?: 'true' | 'false';
  _3d?: 'true' | 'false';
};

export interface WebosDeviceInfo extends Record<string, unknown>, AresDeviceInfo {
  resolution?: string;
  modelYear?: string;
}

export default class WebOSTV {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async getInfo(): Promise<WebosDeviceInfo> {
    try {
      const result = await execCmd(`ares-device-info -d ${this.name}`);
      return parseDeviceInfo(result);
    } catch (e) {
      return {};
    }
  }

  /**
   * Implicitly check Developer Mode is enabled.
   */
  async isDevMode() {
    try {
      await execCmd(`ares-device-info -d ${this.name}`);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        return !DEV_MODE_NOT_ENABLED_ERROR.test(e.message);
      }
      throw e;
    }
  }

  /**
   * Implicitly check ssh key is loaded.
   */
  async isSshKeyLoaded() {
    try {
      await execCmd(`ares-device-info -d ${this.name}`);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        return !SSH_KEY_NOT_LOADED_ERROR.test(e.message);
      }
      throw e;
    }
  }

  async getVersion() {
    try {
      const { sdkVersion } = await this.getInfo();
      return sdkVersion ? parseVersion(sdkVersion) : undefined;
    } catch (error) {
      throw new Error('Unable to get TV webOS version');
    }
  }

  /**
   * Create new TV
   * @param {string} ip - TV IP
   * @param {string} webOSPassphrase - passphrase (from DevMode app)
   */
  async create({ ip, webOSPassphrase }: WebosTvParams) {
    await execCmd(`ares-setup-device --add ${this.name} --info "{\
      'host':'${ip}',\
      'port':'9922',\
      'username':'prisoner'\
    }"`);

    try {
      if (webOSPassphrase && !this.isSshKeyLoaded()) {
        this.loadTvSshKey(webOSPassphrase);
      }
    } catch (e) {
      await this.delete();
      throw e;
    }
  }

  /**
   * Modify existing TV
   * @param {string} [ip] - TV IP
   * @param {string} [webOSPassphrase] - passphrase (from DevMode app)
   */
  async modify({ ip, webOSPassphrase }: Partial<WebosTvParams>) {
    if (ip) {
      await execCmd(`ares-setup-device --modify ${this.name} --info "{'host':'${ip}'}"`);
    }
    if (webOSPassphrase) {
      await this.loadTvSshKey(webOSPassphrase);
    }
  }

  /**
   * Load TV SSH key
   * @param {string} webOSPassphrase
   */
  async loadTvSshKey(webOSPassphrase: string) {
    await execCmd(`ares-novacom --device ${this.name} --getkey --passphrase ${webOSPassphrase}`);
  }

  /**
   * Delete TV if exists
   */
  async delete() {
    await tryExecCmd(`ares-setup-device --remove ${this.name}`);
  }
}

function parseDeviceInfo(str: string) {
  const info: WebosDeviceInfo = str
    .split('\n')
    .map((line) => line.split(' : '))
    .filter(([key]) => TV_INFO_KEYS.includes(key))
    .reduce((result: Record<string, unknown>, [key, value]) => {
      result[key] = value;
      return result;
    }, {});
  info.resolution = detectResolution(info);
  info.modelYear = parseModelName(info.modelName).modelYear;
  return info;
}

function detectResolution(info: AresDeviceInfo) {
  if (info.UHD === 'true') {
    return '3840x2160';
  }
  if (!info.boardType) {
    return undefined;
  }
  // Телевизоры на определённых чипсетах поддерживают только HD разрешение для приложений
  // http://webostv.developer.lge.com/discover/specifications/supported-app-resolution/
  const chipset = chipsetFromBoardType(info.boardType);
  return HD_CHIPSETS.indexOf(chipset.toUpperCase()) >= 0 ? '1280x720' : '1920x1080';
}

function chipsetFromBoardType(boardType: string) {
  return (boardType || '').split('_')[0];
}

function parseModelName(modelName = '') {
  const matches = MODEL_NAME_REGEXPS.map((regexp) => modelName.match(regexp)).filter(Boolean);
  if (matches[0]) {
    return {
      screenSize: matches[0][1],
      modelYear: parseModelYear(matches[0][3]),
    };
  }
  return {};
}

function parseModelYear(modelYear: string): string | undefined {
  if (!modelYear) {
    return '';
  }
  const rawYear = parseInt(modelYear, 10);
  if (!Number.isNaN(rawYear)) {
    return `1${rawYear}`; // OLED 2016-2019
  }
  return MODEL_YEAR_MAP[modelYear];
}
