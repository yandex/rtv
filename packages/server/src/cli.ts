#!/usr/bin/env node

import program from 'commander';
import { version } from './pkg';
import { init as initConfig } from './config';

initConfig();
import { start } from './main';

program.version(version, '-v, --version').parse(process.argv);

start();
