import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import websocket from 'websocket';
import nock from 'nock';
import { WebSocket } from 'mock-socket';
import chai from 'chai';
import loggee, { Level } from 'loggee';
import sinon from 'sinon';
import mockRequire from 'mock-require';
import chaiString from 'chai-string';

// Should be called before uuid import (../src/main => ... => ../middleware/file-uploader => uuid)
mockRequire('uuid', { v4: () => 'mock_uid' });

import { merge } from '../src/config';
import { start, close } from '../src/main';
import * as webOS from '../src/platform/webos';

import * as timespeed from './timespeed';

import { httpPort, streamsPort } from './constants';

import { clearCmdStubs, wsStubs, cmdStubs } from './helpers';

if (!process.env.SHOW_LOGS) {
  loggee.setLogLevel(Level.none);
}

chai.use(chaiString);
chai.config.truncateThreshold = 0;

before(async () => {
  merge({
    port: httpPort,
    streamsPort,
    rtvDataPath: path.join(__dirname),
  });
  await start();
  nock.disableNetConnect();
  nock.enableNetConnect('localhost');
  fs.removeSync(path.resolve(__dirname, '..', '..', '..', '.temp'));
});

beforeEach(() => {
  sinon.stub(websocket, 'w3cwebsocket').callsFake((url) => new WebSocket(url));
  sinon.stub(os, 'networkInterfaces').returns({
    wifi: [{ family: 'IPv4', address: '1.2.3.4' }],
  });
  timespeed.set(50);
  // ToDo: tests for webOS:
  sinon.stub(webOS, 'getNameByIp').returns(null);
  sinon.stub(webOS, 'discoverTVs').returns([]);
});

// afterEach: assertions
afterEach(() => {
  timespeed.reset();
  assertPendingNocks();
  assertPendingCmdStubs();
});

// afterEach: cleanup
afterEach(() => {
  wsStubs.forEach((server) => server.stop());
  wsStubs.clear();
  sinon.restore();
  nock.cleanAll();
  clearCmdStubs();
});

after(async () => {
  nock.restore();
  await close();
});

function assertPendingNocks() {
  if (!nock.isDone()) {
    const pendingMocks = nock.pendingMocks();
    const pendingMocksSliced =
      pendingMocks.length > 5 ? pendingMocks.slice(0, 5).concat(['...and more']) : pendingMocks;
    throw new Error(`Pending mocks (${pendingMocks.length}):\n${pendingMocksSliced.join('\n')}`);
  }
}

function assertPendingCmdStubs() {
  if (cmdStubs.size > 0) {
    throw new Error(`Uncalled CMD stubs:\n${Array.from(cmdStubs.keys()).join('\n')}`);
  }
}
