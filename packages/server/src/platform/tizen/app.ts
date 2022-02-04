import path from 'path';
import qs from 'querystring';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import Timeout from 'await-timeout';
import unzipper from 'unzipper';
import getRawBody from 'raw-body';
import Loggee from 'loggee';
import { beautifyJson, throwIf } from '../../helpers';
import { execCmd, tryExecCmd } from '../../helpers/cli';
import TizenTV from './tv';
import TizenAppDebugger from './app-debugger';
import { extractAppConfigInfo } from './utils';

const logger = Loggee.create('tizen app');

const INSTALLED_APP_API_URL = '{msfBaseUrl}applications/{appId}';
const CLOUD_APP_API_URL = '{msfBaseUrl}webapplication/';
const WAIT_BEFORE_RELAUNCH = 3000;
// When installing apps via sdb we should get install temp directory using command "sdb shell 0 getappinstallpath"
// But on Tizen 4 sdb cannot upload files to directory retrieved this way. So we use hard coded constant path.
const TIZEN4_INSTALL_TEMP_DIR = '/home/owner/share/tmp/sdk_tools/tmp/';
const NOT_FOUND = /Not Found/i;

class TizenApp {
  _tv: TizenTV;
  _appId: string;
  _isCloud: boolean;
  _debugger: TizenAppDebugger | null;
  _packageId: string;
  _msfUrl: string;

  /**
   * Extracts app info from config.xml
   */
  static extractAppInfo = async function (appDir: string) {
    const xml = await fs.readFile(path.join(appDir, 'config.xml'), 'utf8');
    return extractAppConfigInfo(xml);
  };

  /**
   * Extracts app info from wgt package
   */
  static extractWgtAppInfo = async function (wgtPath: string) {
    const xmlBuffer = await getRawBody(fs.createReadStream(wgtPath).pipe(unzipper.ParseOne(/config\.xml/)));
    return extractAppConfigInfo(xmlBuffer.toString());
  };

  constructor(tvIP: string, appId: string) {
    this._tv = new TizenTV(tvIP);
    this._appId = appId;
    this._isCloud = /https?:/i.test(this._appId);
    this._debugger = null;
    this._packageId = this._appId && !this.isStoreId() ? this._appId.split('.')[0] : '';

    const tpl = this._isCloud ? CLOUD_APP_API_URL : INSTALLED_APP_API_URL;
    this._msfUrl = tpl.replace('{msfBaseUrl}', this._tv.msfBaseUrl).replace('{appId}', this._appId);
  }

  get id() {
    return this._appId;
  }

  get tv() {
    return this._tv;
  }

  /**
   * Samsung apps has two different IDs:
   * 1. from config.xml with format: "packageID.appName"
   * 2. assigned after publishing in store and consisting from numbers, e.g. "3201611010983"
   *
   * This method returns true if app instance was created with Store ID.
   */
  isStoreId() {
    return /^\d+$/.test(this._appId);
  }

  /*
  Better use 'tizen' cli instead of sdb cli because tizen cli cares about tizen version etc.
  For tizen 4 use 'sdb' because 'tizen' contains a bug for tizen 4 (installed apps rewrites each other)
  Actually install is:
  [tizen 2.4]
    1. sdb push ./dist/tizen-test/App.wgt /opt/usr/apps/tmp
    2. sdb shell 0 vd_appinstall APP_ID.App /opt/usr/apps/tmp/App.wgt
  [tizen 3.0]
    1. sdb push ./dist/tizen-test/App.wgt /opt/usr/home/owner/apps_rw/tmp
    2. sdb shell 0 setRWIAppID null
    3. sdb shell 0 vd_appinstall APP_ID.App /opt/usr/home/owner/apps_rw/tmp/App.wgt
  [tizen 4.0]
    1. sdb push ./dist/tizen-test/App.wgt /home/owner/share/tmp/sdk_tools/tmp/
    2. sdb shell 0 vd_appinstall APP_ID.App /home/owner/share/tmp/sdk_tools/tmp/App.wgt
  Path on TV is returned by 'sdb shell 0 getappinstallpath' command + '/tmp'
  */
  static async install(ip: string, wgtPath: string) {
    const installCmd = await getInstallCommand(ip, wgtPath);
    // tizen install exits with code=1 even on successful install. So check 'install completed' in stdout.
    const stdout = await tryExecCmd(installCmd);
    throwIf(stdout.indexOf('install completed') === -1, stdout);
    const appId = extractAppId(stdout);
    return { result: 'ok', appId };
  }

  async getState() {
    try {
      const result = await this._msfRequest('GET');
      // Tizen 2.3 always shows running: false, so use this hack
      if (result.visible) {
        result.running = true;
      }
      return {
        installed: true,
        name: result.name,
        running: result.running,
        visible: result.visible,
        version: result.version,
      };
    } catch (err) {
      if (err instanceof Error && NOT_FOUND.test(err.message)) {
        return {
          installed: false,
          running: false,
        };
      }
      throw err;
    }
  }

  /**
   *
   * @param {?Object} [params]
   * @returns {Promise}
   */
  async launch(params?: Record<string, string>) {
    await this.close();
    // in Tizen 3.0 need timeout to re-launch app with params, otherwise app re-launched without params
    await Timeout.set(WAIT_BEFORE_RELAUNCH);
    const bodyObj = this._getLaunchBody(params);
    return this._msfRequest('POST', bodyObj);
  }

  /**
   * Close app if running.
   * Note: not working for Tizen 2.x in debug mode
   * Now is used for cloud apps only
   * @returns {Promise<Boolean>} true if app was closed, false if app was not running
   */
  async msfClose() {
    await this._msfRequest('DELETE');
    return true;
  }

  async uninstall() {
    await this._tv.ensureSdbConnected();
    const stdout = await execCmd(`sdb -s ${this._tv.ip} shell 0 vd_appuninstall ${this._appId}`);
    throwIf(stdout.indexOf('uninstall completed') === -1, stdout);
    return {
      result: 'ok',
      appId: this._appId,
    };
  }

  async debug() {
    this._debugger = this._debugger || new TizenAppDebugger(this);
    return this._debugger.debug();
  }

  /**
   * Launch via sdb.
   * Not useful as requires sdb connection and can not pass params.
   * Re-launches app if it is already launched.
   * NOT USED NOW.
   * @returns {Promise<Boolean>} true if launched
   */
  async sdbLaunch() {
    const stdout = await execCmd(`sdb -s ${this._tv.ip} shell 0 execute ${this._appId} 5000`);
    throwIf(stdout.indexOf('successfully launched') === -1, stdout);
    return true;
  }

  /**
   * Close app - via "msf" for cloud apps, via "sdb" for installed apps
   * @param {number} [timeout=0] - timeout ms after close
   * @returns {Promise<Boolean>} true if launched
   */
  async close(timeout = 0) {
    if (this._isCloud) {
      await this.msfClose();
    } else {
      await this._tv.ensureSdbConnected();
      await this.sdbClose();
    }
    if (timeout) {
      await Timeout.set(timeout);
    }
    return true;
  }

  /**
   * Close app via sdb command.
   * Can close app in debug mode.
   * If running - response is: Pkgid: APP_ID is Terminated
   * If not running - response is: Pkgid: APP_ID is already Terminated
   * But it works not properly on Tizen 2.x. So always return true, even if already closed
   */
  async sdbClose() {
    const stdout = await execCmd(`sdb -s ${this._tv.ip} shell 0 kill ${this._packageId}`);
    throwIf(stdout.indexOf('Terminated') === -1, stdout);
  }

  _getLaunchBody(params?: Record<string, string | string[]>) {
    if (this._isCloud) {
      const url = params ? `${this._appId}?${qs.stringify(params)}` : this._appId;
      return { url };
    } else {
      return params ? { id: JSON.stringify(params) } : null;
    }
  }

  /**
   * Perform msf request.
   * @returns {Promise<Object|null>}
   */
  async _msfRequest(method: string, bodyObj?: Record<string, unknown> | null) {
    logger.log(method.toUpperCase(), this._msfUrl);
    if (bodyObj) {
      logger.log(beautifyJson(bodyObj));
    }
    const response = await fetch(this._msfUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: bodyObj ? JSON.stringify(bodyObj) : undefined,
    });
    const text = await response.text();
    logger.log(`RESPONSE (${response.status}):`, text);
    const json = text ? JSON.parse(text) : null;
    throwIf(!response.ok, (json && json.message) || text);
    return json;
  }
}

function extractAppId(output: string) {
  const matches = output.match(/app_id\[([^\]]+)/i);
  return matches ? matches[1] : '';
}

/**
 * Better use 'tizen' cli instead of sdb cli because tizen cli cares about tizen version etc.
 *  For tizen 4 use 'sdb' because 'tizen' contains a bug (installed apps rewrites each other)
 */
async function getInstallCommand(ip: string, wgtPath: string) {
  const tv = new TizenTV(ip);
  const filename = path.basename(wgtPath);
  const filepath = path.dirname(wgtPath);
  const tvInfo = await tv.getSdbInfo();
  if (tvInfo.major === 4) {
    const appInfo = await TizenApp.extractWgtAppInfo(wgtPath);
    return [
      `sdb -s ${tv.ip}:26101 push ${wgtPath} ${TIZEN4_INSTALL_TEMP_DIR}`,
      `sdb -s ${tv.ip}:26101 shell 0 vd_appinstall ${appInfo.appId} ${TIZEN4_INSTALL_TEMP_DIR}${filename}`,
    ].join(' && ');
  }
  return `tizen install -s ${tv.ip}:26101 -n ${filename} -- ${filepath}`;
}

export default TizenApp;
