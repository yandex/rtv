/**
 * Tizen app debugger class.
 */
import Loggee from 'loggee';
import { DebugPageInfo, getChromeDevtoolsDebugInfo, throwIf, VersionInfo } from '../../helpers';
import { execCmd, tryExecCmd } from '../../helpers/cli';
import TizenTV from './tv';
import TizenApp from './app';

const logger = Loggee.create('tizen app debugger');
// This is internal TV timeout for debug command. No info how it works, but it is required.
const SDB_DEBUG_TIMEOUT = 5000;

export default class TizenAppDebugger {
  _app: TizenApp;
  _tv: TizenTV;
  _debugOutput: string;
  _debugPort: string;

  constructor(app: TizenApp) {
    this._app = app;
    this._tv = app.tv;
    this._debugOutput = '';
    this._debugPort = '';
  }

  async debug() {
    this._checkAppId();

    const sdbInfo = await this._tv.getSdbInfo();
    await this._ensureAppClosed();
    await this._sendDebugCommand(sdbInfo);
    this._extractDebugPort();

    const debugPageInfo = await this._getDebugPageInfo(sdbInfo);
    return this._createResponse(sdbInfo, debugPageInfo);
  }

  _checkAppId() {
    throwIf(this._app.isStoreId(), `You should use app id from config.xml, e.g. "TESTABCDEF.myapp"`);
  }

  async _ensureAppClosed() {
    // always just close app as 'running' can be false even when running
    await this._app.sdbClose();
  }

  async _sendDebugCommand(versionInfo: VersionInfo) {
    const { major } = versionInfo;

    if (major === 2) {
      return this._debug2();
    }

    if (major === 3) {
      return this._debug3();
    }

    return this._debug4();
  }

  async _debug2() {
    this._debugOutput = await execCmd(`sdb -s ${this._tv.ip} shell 0 debug ${this._app.id} ${SDB_DEBUG_TIMEOUT}`);
  }

  async _debug3() {
    let error1, error2;

    await execCmd(`sdb -s ${this._tv.ip} shell 0 setRWIAppID ${this._app.id}`);

    try {
      // this normally outputs "/usr/bin/app_launcher: unrecognized option '--timeout=1000'"
      // but without timeout option debug does not work on Tizen 3.0.
      this._debugOutput = await execCmd(`sdb -s ${this._tv.ip} shell 0 debug ${this._app.id} ${SDB_DEBUG_TIMEOUT}`);
    } catch (e) {
      error1 = e;
    }

    // Always clear setRWIAppID flag. Otherwise app will always start with debugger and show popup.
    const res = await tryExecCmd(`sdb -s ${this._tv.ip} shell 0 setRWIAppID null`);
    if (res.indexOf('error:') >= 0) {
      error2 = new Error(res);
    }

    // Prefer the first error
    if (error1 || error2) {
      throw error1 || error2;
    }
  }

  async _debug4() {
    // On Tizen 4 debug should launch without TIMEOUT parameter
    this._debugOutput = await execCmd(`sdb -s ${this._tv.ip} shell 0 debug ${this._app.id}`);
  }

  _extractDebugPort() {
    const matches = this._debugOutput.match(/port: (\d\d\d\d\d?)/);
    if (!matches) {
      throw new Error(`Debug failed - port not found in output:\n${this._debugOutput}`);
    }

    this._debugPort = matches[1];
  }

  async _getDebugPageInfo(versionInfo: VersionInfo) {
    const pathname = versionInfo.major === 2 ? 'pagelist.json' : 'json/list';
    const url = `http://${this._tv.ip}:${this._debugPort}/${pathname}`;

    logger.log(`Fetching debugger pages: ${url}`);

    return getChromeDevtoolsDebugInfo(url);
  }

  _createResponse(versionInfo: VersionInfo, debugPageInfo: DebugPageInfo) {
    const wsUrl = `${this._tv.ip}:${this._debugPort}/devtools/page/${debugPageInfo.id}`;
    const inspectorUrl = `http://${this._tv.ip}:${this._debugPort}/inspector.html`;
    const debugUrl = `${inspectorUrl}?ws=${wsUrl}`;
    const { major, minor } = versionInfo;

    return {
      wsUrl,
      inspectorUrl,
      debugUrl,
      osMajor: major,
      osMinor: minor,
      title: debugPageInfo.title,
    };
  }
}
