import Client from 'rtv-client';
import open from 'open';

import { RTVCommand } from './types';

// rtv web interface is available on root server path
const uiUrl = (apiUrl: string) => new URL(apiUrl).origin;

/**
 * System commands
 */
export default (client: Client): Record<string, RTVCommand> => ({
  env: {
    command: 'env',
    description: 'Server environment info',
    action: () => client.system.env(),
  },

  status: {
    command: 'status',
    description: 'Server status',
    action: () => client.system.status(),
  },

  ui: {
    command: 'ui',
    description: 'Run rtv web interface in browser',
    action: () => client.config.apiUrl && open(uiUrl(client.config.apiUrl)),
  },
});
