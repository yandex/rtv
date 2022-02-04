import Client from 'rtv-client';

import tvCommands from './tv';
import appCommands from './app';
import systemCommands from './system';

import { RTVCommand } from './types';

export default (client: Client): Record<string, RTVCommand> => ({
  ...tvCommands(client),
  ...appCommands(client),
  ...systemCommands(client),
});
