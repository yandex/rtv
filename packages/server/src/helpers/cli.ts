/**
 * CLI Helpers
 */

import childProcess from 'child_process';
import util from 'util';
import Loggee from 'loggee';
import { values as config } from '../config';
import { throwIf } from './';

const logger = Loggee.create();

export const exec = util.promisify(childProcess.exec);

const CMD_TIMEOUT = 60 * 1000;

/**
 * Exec cmd.
 * @param {String} cmd
 * @returns {Promise}
 */
export const execCmd = async function (cmd: string, options = { isSilent: false }) {
  logger.log(`CMD: ${cmd}`);
  const fullCmd = expandPath(cmd);
  // Explicitly set cwd to avoid problem when ares-setup-device --listfull founds no TVs
  const { stdout } = await exec(fullCmd, {
    timeout: CMD_TIMEOUT,
    cwd: process.cwd(),
  });
  const cleanStdout = cleanOutput(stdout);
  if (!options.isSilent) {
    logger.log(`STDOUT: ${cleanStdout}`);
  }
  return cleanStdout;
};

/**
 * Try exec cmd and return stdout even for non-zero exit code.
 * @param {String} cmd
 * @param {String?} outputForError value if error occurs
 */
export const tryExecCmd = async function (cmd: string, outputForError?: string) {
  try {
    return await execCmd(cmd);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // In tests caught error can be assertion error,
    // so catch only child process errors (they have stdout/stderr props)
    const isChildProcessError = e.stdout !== undefined;
    throwIf(!isChildProcessError, e);
    const output = cleanOutput(e.stdout) || cleanOutput(e.stderr);
    logger.log(`STDOUT (code=${e.status}): ${output}`);
    return outputForError === undefined ? output : outputForError;
  }
};

/**
 * Spawn process
 */
export const spawn = function (cmd: string) {
  logger.log(`CMD: ${cmd}`);
  const fullCmd = expandPath(cmd);
  return childProcess.spawn(fullCmd, { shell: true });
};

function expandPath(cmd: string) {
  return cmd
    .replace(/^sdb\s/, `${config.sdbPath}/$&`)
    .replace(/^tizen\s/, `${config.tizenPath}/$&`)
    .replace(/^ares-/, `${config.aresPath}/$&`);
}

function cleanOutput(output: string) {
  return output.toString().trim();
}
