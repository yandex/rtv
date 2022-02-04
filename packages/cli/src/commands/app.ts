import Client from 'rtv-client';

import { RTVCommand } from './types';

/**
 * App commands
 */
export default (client: Client): Record<string, RTVCommand> => ({
  installApp: {
    command: 'app-install <ip> <wgt|zip|path>',
    options: [
      ['-n, --noMinify', 'not minify application (webOS only)', false],
      ['--appId <appId>', 'application ID (Orsay only)'],
    ],
    description: 'Install app on the TV',
    action: (ip, path, { noMinify, appId }) => client.app.installApp(ip, path, { appId, noMinify }),
  },

  packApp: {
    command: 'app-pack <path> <out>',
    options: [
      ['-n, --noMinify', 'not minify application (webOS only)', false],
      ['-r , --resolution <resolution>', 'resolution (webOS only)', '1920x1080'],
      ['--tizenSecurityProfile <profile>', 'security profile (Tizen only)', ''],
    ],
    description:
      'Pack app from path on server and write to out file. ' +
      'Platform is detected by out file extension: .wgt for tizen, .ipk for webOS',
    action: (path, out, { resolution, noMinify, tizenSecurityProfile }) => {
      return client.app.packApp(path, out, {
        resolution,
        noMinify,
        tizenSecurityProfile,
      });
    },
  },

  stateApp: {
    command: 'app-state <ip> <appId>',
    description: 'Get state of app on TV',
    action: (ip, appId) => client.app.stateApp(ip, appId),
  },

  launchApp: {
    command: 'app-launch <ip> <appId|url> [jsonParams]',
    description: 'Launch app on TV',
    action: (ip, appId, params) => client.app.launchApp(ip, appId, params),
  },

  debugApp: {
    command: 'app-debug <ip> <appId> [jsonParams]',
    description:
      'Debug app on TV ([jsonParams] are supported only by webOS, ' +
      'example: rtv app-debug <ip> <appId> "{showLog: true}")',
    options: [['-a, --attach', "attach to app if it's already running (for webOS only)"]],
    action: (ip, appId, params, { attach }) => client.app.debugApp(ip, appId, params, { attach }),
  },

  closeApp: {
    command: 'app-close <ip> <appId>',
    description: 'Close app on TV',
    action: (ip, appId) => client.app.closeApp(ip, appId),
  },

  uninstallApp: {
    command: 'app-uninstall <ip> <appId>',
    description: 'Uninstall app from TV',
    action: (ip, appId) => client.app.uninstallApp(ip, appId),
  },

  getAppList: {
    command: 'app-list <ip>',
    description: 'Get all installed apps on TV',
    action: (ip) => client.app.getAppList(ip),
  },
});
