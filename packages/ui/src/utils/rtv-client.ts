/**
 * Rtv-client interface
 */
import RTVClient, { KnownApp, KnownTv } from 'rtv-client';

import { log as logMessage, error } from './logs';

const options = { apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api' };

const rtvClient = new RTVClient(options);

const forcedClient = new RTVClient({ ...options, checkTvIsOccupied: false });

const convertToLogMessage = (message: unknown) =>
  message !== null && typeof message === 'object' ? message : String(message);

const log = (message: unknown) => {
  logMessage(convertToLogMessage(message));
};

const logError = (message: unknown) => {
  error(convertToLogMessage(message));
};

const execCmd = async <T>(promise: Promise<T>, { logResult = false, logErrors = true } = {}) => {
  try {
    const result = await promise;
    if (logResult) {
      log(result);
    }
    return result;
  } catch (error) {
    if (logErrors) {
      logError(error instanceof Error ? error.message || error : error);
    }
    throw error;
  }
};

export async function fetchTvInfo(ip: string) {
  return execCmd(rtvClient.tv.info(ip), { logResult: false, logErrors: false });
}

export async function getAppState(ip: string, id: string) {
  return execCmd(rtvClient.app.stateApp(ip, id), { logResult: false, logErrors: false });
}

export async function appClose(ip: string, id: string) {
  log('Closing application...');
  return execCmd(rtvClient.app.closeApp(ip, id), { logResult: true });
}

export async function appLaunch(ip: string, id: string, params: Record<string, unknown>) {
  log('Starting application...');
  return execCmd(rtvClient.app.launchApp(ip, id, params), { logResult: true });
}

export async function appDebug(ip: string, id: string, params: Record<string, unknown>) {
  log('Starting debug application...');
  return execCmd(rtvClient.app.debugApp(ip, id, params, {}), { logResult: true });
}

export async function appUninstall(ip: string, id: string) {
  log('Uninstalling application...');
  return execCmd(rtvClient.app.uninstallApp(ip, id), { logResult: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function appInstall(ip: string, file: any, appId: string) {
  log('Installing application...');
  return execCmd(rtvClient.app.installApp(ip, file, { appId }), { logResult: true });
}

export async function getKnownTvs({ showInvisible = false, additionalInfo = false } = {}) {
  return execCmd(rtvClient.tv.getKnownTvs({ showInvisible, additionalInfo }), { logErrors: false });
}

export async function saveKnownTv(tv: KnownTv) {
  return execCmd(rtvClient.tv.saveKnownTv(tv), { logErrors: false });
}

export async function deleteKnownTv(id: string) {
  return execCmd(rtvClient.tv.deleteKnownTv(id), { logErrors: false });
}

export async function getKnownApps() {
  return execCmd(rtvClient.app.getKnownApps(), { logErrors: false });
}

export async function saveKnownApp(app: KnownApp) {
  return execCmd(rtvClient.app.saveKnownApp(app), { logErrors: false });
}

export async function deleteKnownApp(id: string) {
  return execCmd(rtvClient.app.deleteKnownApp(id), { logErrors: false });
}

export async function wakeUp(ip: string) {
  log('Wake up TV...');
  return execCmd(rtvClient.tv.up(ip), { logResult: true });
}

export async function remoteControl(ip: string, { onClose }: { onClose: (() => void) | undefined }) {
  log('Enable remote control...');
  return execCmd(rtvClient.tv.remoteControl(ip, { onClose }));
}

export async function enableDevMode(ip: string) {
  log('Try enable Dev Mode...');
  return execCmd(rtvClient.tv.enableDevMode(ip), { logResult: true });
}

export async function roomList() {
  return execCmd(rtvClient.room.list());
}

export async function free(ip: string, isForce: boolean) {
  return execCmd(isForce ? forcedClient.tv.free(ip) : rtvClient.tv.free(ip));
}
