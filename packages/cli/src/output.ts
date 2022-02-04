/**
 * Having separate class for log is convenient for client testing: you can stub output,
 * but keep console.log messages.
 */

/* eslint-disable no-console */

import 'console.table';
import chalk from 'chalk';

export const log = (str: string) => console.log(str);
export const warn = (str: string) => console.log(chalk.yellow(str));
export const error = (str: string) => console.log(chalk.red(str));
export const table = (...args: any[]) => console.table(...args);
