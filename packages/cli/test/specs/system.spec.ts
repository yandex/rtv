import sinon from 'sinon';
import clientConfig from '../../../client/dist/config';

import cliCmd from '../helpers/cli-cmd';

import { serverMock, serverHost } from '../constants';

describe('cli:system', () => {
  it('should check client version is less then server version', async () => {
    serverMock.get('/api/system/status').reply(200, {}, { 'x-rtv-server-version': '0.0.1' });
    const logger = await cliCmd('status');
    sinon.assert.calledWithMatch(logger.warn, '0.0.1');
  });

  it('should check client version is bigger then server version', async () => {
    serverMock.get('/api/system/status').reply(200, {}, { 'x-rtv-server-version': '999.0.0' });
    const logger = await cliCmd('status');
    sinon.assert.calledWithMatch(logger.warn, '999.0.0');
  });

  it('show request', async () => {
    serverMock.get('/api/system/status').reply(200, '');
    const logger = await cliCmd('status');
    sinon.assert.calledWith(logger.log, `GET ${serverHost}/api/system/status`);
  });

  it('request timeout', async () => {
    serverMock.get('/api/system/status').delay(200).reply(200, '');
    sinon.stub(clientConfig, 'timeout').get(() => 100);

    const logger = await cliCmd('status');
    sinon.assert.calledWith(
      logger.error,
      'Error: network timeout at: http://rtv-mock-server/api/system/status.\nPlease check network connection and re-try again.'
    );
  });

  it('request env', async () => {
    const env = {
      ip: '1.2.3.4',
      sdb: 'Smart Development Bridge version 4.1.3',
      tizen: 'Tizen CLI 2.4.48',
      ares: 'foo',
      node: 'v8.15.1',
      platform: 'linux',
      network: 'NAME         TYPE             ACTIVE  DEVICE\nMobTest      802-11-wireless  yes     wlp1s0',
    };
    serverMock.get('/api/system/env').delay(200).reply(200, env);

    const logger = await cliCmd('env');
    sinon.assert.calledWithMatch(logger.table, env);
  });
});
