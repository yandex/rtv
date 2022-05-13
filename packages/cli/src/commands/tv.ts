import Client from 'rtv-client';

import { RTVCommand } from './types';

/**
 * TV commands
 */
export default (client: Client): Record<string, RTVCommand> => ({
  list: {
    command: 'list',
    description: 'List all connected TVs',
    action: ({ fullscan }) => client.tv.list({ fullscan }),
    options: [['-s, --fullscan', 'scan server network (for Tizen only)', false]],
  },
  
  known: {
    command: 'known',
    description: 'List all known TVs',
    action: ({ all, extra }) => client.tv.list({ showInvisible: all, additionalInfo: extra }),
    options: [
      ['-a, --all', 'Show all TVs (including invisible ones)', false],
      ['-e, --extra', 'Add additional info to the response', false],
    ],
  },
  
  info: {
    command: 'info <ip>',
    description: 'Get info about connected TV',
    action: (ip) => client.tv.info(ip),
  },

  devPanel: {
    command: 'dev-panel <ip>',
    description: 'Get developer panel URL',
    action: (ip) => client.tv.devPanel(ip),
  },

  tvLogs: {
    command: 'tv-logs <ip>',
    description: 'Connect logger to tv and get log page',
    action: (ip) => client.tv.tvLogs(ip),
  },

  browser: {
    command: 'browser <ip> [url]',
    description: 'Launch TV browser with URL',
    action: (ip, url) => client.tv.browser(ip, url),
  },

  up: {
    command: 'up <ip>',
    description: 'Wake up TV',
    action: (ip) => client.tv.up(ip),
  },

  free: {
    command: 'free <ip>',
    description: 'Free TV',
    action: (ip) => client.tv.free(ip),
  },
});
