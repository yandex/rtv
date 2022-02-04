import path from 'path';
import sinon from 'sinon';
import nock from 'nock';

import cliPkg from '../../src/pkg';
import cliCmd from '../helpers/cli-cmd';
import { serverMock, serverHost } from '../constants';

const mockServerByHeaders = ({
  reqHeaders,
  badHeaders,
}: {
  reqHeaders?: Record<string, nock.RequestHeaderMatcher>;
  badHeaders?: string[];
}) => {
  return nock(serverHost, {
    reqheaders: reqHeaders,
    badheaders: badHeaders,
  }).defaultReplyHeaders({
    'x-rtv-server-version': cliPkg?.version || '',
  });
};

describe('cli:common', async () => {
  it('set x-rtv-check-last-used header without --force', async () => {
    mockServerByHeaders({
      reqHeaders: {
        'x-rtv-check-last-used': 'true',
      },
    })
      .post('/api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.App')
      .reply(200, { foo: 'with x-rtv-check-last-used' });

    const logger = await cliCmd('app-launch 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWith(logger.table, {
      foo: 'with x-rtv-check-last-used',
    });
  });

  it('skip x-rtv-check-last-used header with --force', async () => {
    mockServerByHeaders({
      badHeaders: ['x-rtv-check-last-used'],
    })
      .post('/api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.App')
      .reply(200, { foo: 'without x-rtv-check-last-used' });

    const logger = await cliCmd('app-launch 1.2.3.5 TESTABCDEF.App -f');
    sinon.assert.calledWith(logger.table, {
      foo: 'without x-rtv-check-last-used',
    });
  });

  it('should show error when tv is occupied', async () => {
    serverMock.post('/api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.App').reply(500, {
      message: 'Error: 1.2.3.5 is occupied by user1',
      type: 'tv-is-occupied',
    });

    const logger = await cliCmd('app-launch 1.2.3.5 TESTABCDEF.App');
    sinon.assert.calledWith(
      logger.error,
      'Error: Error: 1.2.3.5 is occupied by user1.\nUse -f option to force command.'
    );
  });

  it('read config from custom file', async () => {
    const customServerMock = nock('http://custom-server').defaultReplyHeaders({
      'x-rtv-server-version': cliPkg?.version || '',
    });

    const customConfigPath = path.resolve(__dirname, '..', '.rtvrc-test');

    customServerMock.get('/api/system/status').reply(200, 'foo');
    const logger = await cliCmd(`--config ${customConfigPath} status`);
    sinon.assert.calledWith(logger.log, `GET http://custom-server/api/system/status`);
  });
});
