import { ExecOptions } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { assert } from 'chai';
import fetch, { RequestInit } from 'node-fetch';
import * as mockSocket from 'mock-socket';
import sinon, { SinonStub } from 'sinon';
import Timeout from 'await-timeout';

import RTVClient from '../../client/src';
import * as cli from '../src/helpers/cli';

import { serverHost } from './constants';

export const cmdStubs = new Map();
export const wsStubs = new Map();

export const rtvClient = new RTVClient({
  apiUrl: `${serverHost}/api`,
  user: 'test',
});

export async function req(path: string, options: RequestInit = {}) {
  const url = `${serverHost}/${path}`;

  return fetch(url, setHeaders(options));
}

export async function reqJson(path: string, options: RequestInit = {}) {
  const response = await req(path, options);
  return response.json();
}

export function reqPostJson(path: string, body: Record<string, string>) {
  return reqJson(path, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
}

export function setHeaders(options: RequestInit): RequestInit {
  const headers = (options.headers as Record<string, string>) || {};
  if (!('x-rtv-user' in headers)) {
    headers['x-rtv-user'] = 'test';
  }
  options.headers = headers;

  return options;
}

export function getMock<T>(file: string, props?: T) {
  const content = fs.readFileSync(path.join('test', 'mocks', file), 'utf8');
  const isJson = file.endsWith('.json');
  if (isJson) {
    const json = JSON.parse(content);
    return Object.assign(json, props);
  } else {
    return content;
  }
}

export function stubCmd(cmd: string, stdout: string, options = {}) {
  if (!(cli.exec as SinonStub).callsFake) {
    sinon.stub(cli, 'exec').callsFake(fakeChildProcessExec);
  }
  cmdStubs.set(cmd, { stdout, options });
}

export function clearCmdStubs(prefix = '') {
  cmdStubs.forEach((value, cmd) => {
    if (cmd.startsWith(prefix)) {
      cmdStubs.delete(cmd);
    }
  });
}

export async function fakeChildProcessExec(realCmd: string, realOptions: ExecOptions) {
  for (const cmd of cmdStubs.keys()) {
    if (realCmd.endsWith(cmd)) {
      return Promise.race([
        realOptions.timeout ? Timeout.set(realOptions.timeout, `spawn /bin/sh ETIMEDOUT: ${cmd}`) : Promise.resolve(),
        fakeExecCmd(cmd),
      ]);
    }
  }
  throw new Error(`Unstubbed cmd: ${realCmd}`);
}

export async function fakeExecCmd(cmd: string) {
  const { stdout, options } = cmdStubs.get(cmd);
  cmdStubs.delete(cmd);
  if (options.timeout) {
    await Timeout.set(options.timeout);
  }
  if (options.error) {
    const error = new Error('CMD error');
    Object.assign(error, {
      stdout: '',
      stderr: stdout,
    });
    throw error;
  }
  return { stdout };
}

export function stubWS(url: string) {
  const server = new mockSocket.Server(url);
  wsStubs.set(url, server);
  return server;
}

export function assertError(response: { message: string }, message: string) {
  assert.property(response, 'message');
  assert.startsWith(response.message, message);
}
