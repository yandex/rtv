import sinon from 'sinon';

import { serverMock, serverHost } from '../constants';
import cliCmd from '../helpers/cli-cmd';

describe('cli:tv', () => {
  it('list with fullscan=false (by default)', async () => {
    const tvs = [
      {
        platform: 'tizen',
        ip: '1.2.3.5',
        name: '[TV] Kitchen',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '87.250.238.225',
        hasAccess: false,
        alias: 'tizen',
        lastUsed: 'unknown',
        streamUrl: '',
      },
    ];
    serverMock.get('/api/tv/list?fullscan=false').reply(200, tvs);

    const logger = await cliCmd('list');
    sinon.assert.calledWith(logger.table, tvs);
  });

  it('list with fullscan=true', async () => {
    const tvs = [
      {
        platform: 'tizen',
        ip: '1.2.3.5',
        name: '[TV] Kitchen',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '87.250.238.225',
        hasAccess: false,
        alias: 'tizen',
        lastUsed: 'unknown',
        streamUrl: '',
      },
      {
        platform: 'webos',
        ip: '1.2.3.6',
        name: '[TV] Test',
        modelYear: '18',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '10.0.42.1',
        hasAccess: false,
        alias: 'webos',
        lastUsed: 'unknown',
        streamUrl: '',
      },
    ];
    serverMock.get('/api/tv/list?fullscan=true').reply(200, tvs);

    const logger = await cliCmd('list -s');
    sinon.assert.calledWith(logger.table, tvs);
  });

  it('info', async () => {
    const tv = {
      platform: 'tizen',
      ip: '1.2.3.5',
      name: '[TV] Kitchen',
      modelName: 'UE49K5500',
      modelYear: '16',
      resolution: '1920x1080',
      developerMode: true,
      developerIP: '87.250.238.225',
      hasAccess: false,
      osVersion: null,
      alias: '',
      streamUrl: '',
    };
    serverMock.get('/api/tv/info?ip=1.2.3.5').reply(200, tv);

    const logger = await cliCmd('info 1.2.3.5');
    sinon.assert.calledWithMatch(logger.table, {
      ip: '1.2.3.5',
    });
  });

  it('dev-panel', async () => {
    serverMock.get('/api/tv/dev-panel?ip=1.2.3.5').reply(200, {
      url: `${serverHost}/proxy/http/1.2.3.5/8001/`,
    });

    const logger = await cliCmd('dev-panel 1.2.3.5');
    sinon.assert.calledWithMatch(logger.table, {
      url: `${serverHost}/proxy/http/1.2.3.5/8001/`,
    });
  });

  it('tv-logs', async () => {
    serverMock.get('/api/tv/logs?ip=1.2.3.5').reply(200, {
      url: `${serverHost}/tizen/logs?ip=1.2.3.5`,
    });

    const logger = await cliCmd('tv-logs 1.2.3.5');
    sinon.assert.calledWithMatch(logger.table, {
      url: `${serverHost}/tizen/logs?ip=1.2.3.5`,
    });
  });

  it('browser', async () => {
    serverMock.post('/api/tv/browser?ip=1.2.3.5').reply(200, {
      appId: 'org.tizen.browser',
      launched: true,
    });

    const logger = await cliCmd('browser 1.2.3.5');
    sinon.assert.calledWithMatch(logger.table, {
      appId: 'org.tizen.browser',
    });
  });

  it('browser with url', async () => {
    serverMock.post(`/api/tv/browser?ip=1.2.3.5&url=google.com`).reply(200, {
      appId: 'org.tizen.browser',
      url: 'http://google.com',
      launched: true,
    });

    const logger = await cliCmd('browser 1.2.3.5 google.com');
    sinon.assert.calledWithMatch(logger.table, {
      url: 'http://google.com',
    });
  });

  it('up', async () => {
    serverMock.post('/api/tv/up?ip=1.2.3.5').reply(200, {
      result: 'Wake up tv with ip 1.2.3.5',
    });

    const logger = await cliCmd('up 1.2.3.5');
    sinon.assert.calledWithMatch(logger.table, {
      result: 'Wake up tv with ip 1.2.3.5',
    });
  });
});
