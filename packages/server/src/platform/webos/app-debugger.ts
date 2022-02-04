/**
 * webOS application debugger
 */
import Timeout from 'await-timeout';
import Loggee from 'loggee';
import { DebugPageInfo, getChromeDevtoolsDebugInfo, NotNullOrUndefined, VersionInfo } from '../../helpers';
import { spawn, execCmd } from '../../helpers/cli';
import WebOSApp from './app';
import WebOSTV from './tv';

const logger = Loggee.create('webOS app debugger');
const AFTER_CLOSE_TIMEOUT = 1000;

/**
 * webOS app debugger spawns processes. We should clean them up periodically
 */
const DEBUGGER_PROCESS_REGEXP = /([0-9]+) .+ares-inspect(\.js)? -d (.+) --app (.+)/;
const DEBUGGER_CLEANUP_INTERVAL = 300 * 1000; // 5 min
setInterval(cleanupDebuggers, DEBUGGER_CLEANUP_INTERVAL).unref();

export default class WebOSAppDebugger {
  _app: WebOSApp;
  _tv: WebOSTV;

  constructor(app: WebOSApp) {
    this._app = app;
    this._tv = app.tv;
  }

  async debug(params?: Record<string, unknown>, options?: { attach: boolean }) {
    const attach = Boolean(options && options.attach);
    try {
      const version = await this._tv.getVersion();
      !attach && (await this._ensureAppClosed());
      await cleanupDebuggers();
      !attach && (await this._app.launch(params));
      const debugPort = await this._sendDebugCommand();
      const debugPageInfo = await this._getDebugPageInfo(version, debugPort);
      return this._createResponse(version, debugPageInfo, debugPort);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to start debug: ${error.message}`);
      }
      throw error;
    }
  }

  async cleanUp() {
    await cleanupDebuggers(this._app);
  }

  async _ensureAppClosed() {
    const appState = await this._app.getState();
    if (appState.running) {
      await this._app.close();
      await Timeout.set(AFTER_CLOSE_TIMEOUT);
    }
  }

  async _sendDebugCommand() {
    try {
      const stdout: string = await new Promise((resolve, reject) => {
        const process = spawn(`ares-inspect -d ${this._tv.name} --app ${this._app.id}`);
        process.stdout.on('data', (data) => resolve(data.toString()));
        process.on('error', (error) => reject(error));
      });
      return this._extractDebugPort(stdout);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Cannot run ares-inspect: ${error.message}`);
      }
      throw error;
    }
  }

  // extracting port from url like http://localhost:53041/devtools/devtools.html...
  _extractDebugPort(str: string) {
    const matches = str.match(/localhost:(\d+)\//);
    if (!matches) {
      throw new Error(`Debug failed - port not found in output:\n${str}`);
    }
    return parseInt(matches[1]);
  }

  async _getDebugPageInfo(version: VersionInfo | undefined, debugPort: number) {
    const pathname = !version || version.major < 3 ? 'pagelist.json' : 'json/list';
    const url = `http://localhost:${debugPort}/${pathname}`;
    logger.log(`Fetching debugger pages: ${url}`);
    // when tv is just awakened, fetch can be failed
    return getChromeDevtoolsDebugInfo(url);
  }

  async _createResponse(version: VersionInfo | undefined, debugPageInfo: DebugPageInfo, debugPort: number) {
    const wsUrl = `localhost:${debugPort}/devtools/page/${debugPageInfo.id}`;
    const inspectorUrl = `http://localhost:${debugPort}/inspector.html`;
    const debugUrl = `${inspectorUrl}?ws=${wsUrl}`;
    return {
      wsUrl,
      inspectorUrl,
      debugUrl,
      osMajor: version ? version.major : undefined,
      osMinor: version ? version.minor : undefined,
      title: debugPageInfo.title,
    };
  }
}

/**
 * Clean up running debuggers
 * @param {Object} [app] - clean up debuggers only for this application
 */
async function cleanupDebuggers(app?: WebOSApp) {
  logger.log('Cleaning debuggers...');
  let debuggers = await getSpawnedDebuggers();
  if (app) {
    debuggers = debuggers.filter(({ tvName, appId }) => app.tvName === tvName && app.id === appId);
  }
  logger.log(`Found running debuggers: ${debuggers.length}`);
  for (let index = 0; index < debuggers.length; index++) {
    const { pids, tvName, appId } = debuggers[index];
    const appState = await new WebOSApp(tvName, appId).getState();
    if (!appState.running && pids && pids.length > 0) {
      logger.log(`Shutting down PIDs ${pids.join(', ')} for application "${appId}" on "${tvName}"`);
      await execCmd(`kill -9 ${pids.join(' ')}`);
    }
  }
}

/**
 * @returns Array<{tvName, appId}>
 */

async function getSpawnedDebuggers() {
  const stdout = await execCmd('ps -ax | grep ares-inspect');
  return stdout
    .split('\n')
    .map((process: string) => process.match(DEBUGGER_PROCESS_REGEXP))
    .filter(NotNullOrUndefined)
    .reduce((result: { pids: string[]; tvName: string; appId: string }[], [, pid, , tvName, appId]) => {
      // "ps -ax" returns two processes (bash and node) for each debugger, group them by tvName and appId
      if (result[0] && result[0].tvName === tvName && result[0].appId === appId) {
        result[0].pids.push(pid);
      } else {
        result.unshift({ tvName, appId, pids: [pid] });
      }
      return result;
    }, []);
}
