/**
 * Main program module
 */
import commander from 'commander';
import Client from 'rtv-client';

import pkg from './pkg';
import getCommands from './commands';
import { initConfig, readFromFile } from './config-manager';
import { log as outputLog, error as outputError, table as outputTable } from './output';
import { logError } from './logger';
import { onNeedUpdate } from './versions';

export default function (argv: string[]) {
  const program = new commander.Command();

  const config = initConfig();
  const client = new Client(config, {
    onRequest: outputLog,
    onNeedUpdate: onNeedUpdate,
  });
  const commands = getCommands(client);
  let isVerbose = false;

  program
    .description('Remote TV management CLI')
    .usage(`<command> [options]`)
    .option('-c, --config <path>', 'path to config file', '.rtvrc')
    .on('option:config', () => {
      const newConfig = readFromFile(program.config);
      client.mergeConfig(newConfig);
    })
    .option('--verbose', 'verbose output')
    .on('option:verbose', () => {
      isVerbose = true;
    })
    .option('-f, --force', 'skip checking TV was recently used by someone else')
    .on('option:force', () => {
      client.mergeConfig({ checkTvIsOccupied: false });
    })
    .version(pkg?.version, '-v, --version');

  Object.values(commands).forEach(({ command, description, action, options = [] }) => {
    const res = program
      .command(command)
      .description(description)
      .action(async (...args) => {
        try {
          const res = await action(...args);
          outputTable(res);
        } catch (err) {
          if (err instanceof Error) {
            logError(err, isVerbose);
          }
        }
      });

    options.forEach((option) => res.option(...option));
  });

  program.on('command:*', function () {
    outputError(`Invalid command: ${program.args.join(' ')}`);
    program.help();
  });

  program.parse(argv);

  if (program.args.length === 0) {
    program.help();
  }
}
