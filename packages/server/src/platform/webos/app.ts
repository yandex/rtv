/**
 * webOS application
 */
import { tryExecCmd } from '../../helpers/cli';
import WebOSTV from './tv';

export default class WebOSApp {
  _id?: string;
  _tvName: string;
  _tv: WebOSTV;

  constructor(tvName: string, appId: string) {
    this._id = appId;
    this._tvName = tvName;
    this._tv = new WebOSTV(this._tvName);
  }

  get tvName() {
    return this._tvName;
  }

  get tv() {
    return this._tv;
  }

  get id() {
    return this._id;
  }

  static async install(packagePath: string, tvName: string) {
    return tryExecCmd(`ares-install -d ${tvName} ${packagePath}`);
  }

  async getState() {
    const result = await tryExecCmd(`ares-launch -d ${this._tvName} -r`);
    const runningAppsIds = result.split('\n');
    return {
      installed: true,
      running: this._id ? runningAppsIds.includes(this._id) : false,
    };
  }

  async launch(params?: Record<string, unknown>) {
    const state = await this.getState();
    if (state.running) {
      await this.close();
    }
    const paramsPart = params ? `-p '${JSON.stringify(params)}'` : '';
    return tryExecCmd(`ares-launch -d ${this._tvName} ${this._id} ${paramsPart}`);
  }

  async close() {
    return tryExecCmd(`ares-launch -d ${this._tvName} --close ${this._id}`);
  }

  async uninstall() {
    return tryExecCmd(`ares-install -d ${this._tvName} --remove ${this._id}`);
  }
}
