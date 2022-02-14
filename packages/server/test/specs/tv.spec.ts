import nock from 'nock';
import { assert } from 'chai';
import sinon from 'sinon';
import MemoryAdapter from 'lowdb/adapters/Memory';

import { initDb } from '../../src/helpers/db';
import * as WssTokenManager from '../../src/platform/tizen/wss-token-manager';
import { toBase64 } from '../../src/helpers';
import { KnownTv } from '../../src/api/tv/types';

import { httpPort } from '../constants';
import { assertError, getMock, req, reqJson, reqPostJson, stubCmd, stubWS } from '../helpers';

describe('tv', () => {
  describe('info', () => {
    before(async () => {
      reqPostJson('api/tv/free?ip=1.2.3.5', {});
      reqPostJson('api/tv/free?ip=1.2.3.6', {});
    });

    it('tv did not respond', async () => {
      nock('http://1.2.3.5:8001').get('/api/v2/').delay(3001).reply(200, '');
      const result = await reqJson('api/tv/info?ip=1.2.3.5');
      assertError(result, 'Error: TV (1.2.3.5) does not respond in 3000 ms. Is it connected to network and turned on?');
    });

    it('validate incorrect ip', async () => {
      const result = await reqJson('api/tv/info?ip=1.2.3.5.6');
      assertError(result, 'Error: Valiadation failed: Incorrect "ip" or "alias"');
    });

    it('validate incorrect alias', async () => {
      const result = await reqJson('api/tv/info?ip=unknownAlias');
      assertError(result, 'Error: Valiadation failed: Incorrect "ip" or "alias"');
    });

    it('tizen24 + no access', async () => {
      const response = getMock('tizen24/msf_tv_info.json');
      nock('http://1.2.3.5:8001').get('/api/v2/').reply(200, response);
      const result = await reqJson('api/tv/info?ip=1.2.3.5');
      assert.deepEqual(result, {
        id: '2',
        platform: 'tizen',
        ip: '1.2.3.5',
        mac: 'AA:AA:AA:AA:AA:AA',
        name: '[TV] Kitchen',
        modelName: 'UE49K5500',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '87.250.238.225',
        hasAccess: false,
        osVersion: null,
        alias: '',
        lastUsed: 'unknown',
      });
    });

    it('tizen24 + has access', async () => {
      const response = getMock('tizen24/msf_tv_info.json');
      response.device.developerIP = '1.2.3.4';
      nock('http://1.2.3.5:8001').persist().get('/api/v2/').reply(200, response);
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      const result = await reqJson('api/tv/info?ip=1.2.3.5');
      assert.deepEqual(result, {
        id: '2',
        platform: 'tizen',
        ip: '1.2.3.5',
        mac: 'AA:AA:AA:AA:AA:AA',
        name: '[TV] Kitchen',
        modelName: 'UE49K5500',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '1.2.3.4',
        hasAccess: true,
        osVersion: '2.4.0',
        alias: '',
        lastUsed: 'unknown',
      });
    });

    it('tizen30 + no access', async () => {
      nock('http://1.2.3.5:8001').get('/api/v2/').reply(200, getMock('tizen30/msf_tv_info.json'));
      const result = await reqJson('api/tv/info?ip=1.2.3.5');
      assert.deepEqual(result, {
        platform: 'tizen',
        id: '2',
        ip: '87.250.238.242',
        mac: 'AA:AA:AA:AA:AA:AA',
        name: '[TV] Galina',
        modelName: 'UE40MU6100',
        modelYear: '17',
        resolution: '3840x2160',
        developerMode: true,
        developerIP: '87.250.238.251',
        hasAccess: false,
        osVersion: null,
        alias: '',
        lastUsed: 'unknown',
      });
    });

    it('tizen23 + no access', async () => {
      const response = getMock('tizen23/msf_tv_info.json');
      nock('http://1.2.3.6:8001').get('/api/v2/').reply(200, response);
      const result = await reqJson('api/tv/info?ip=1.2.3.6');
      assert.deepEqual(result, {
        platform: 'tizen',
        id: '1',
        ip: '1.2.3.6',
        mac: 'AA:AA:AA:AA:AA:AA',
        name: '[TV] UE40J6390',
        modelName: 'UE40J6330',
        modelYear: '15',
        resolution: '1920x1080',
        developerMode: false,
        developerIP: '1.1.1.1',
        hasAccess: false,
        osVersion: null,
        alias: 'test',
        lastUsed: 'unknown',
      });
    });

    it('tizen23 + has access', async () => {
      const response = getMock('tizen23/msf_tv_info.json');
      response.device.developerIP = '1.2.3.4';
      nock('http://1.2.3.6:8001').persist().get('/api/v2/').reply(200, response);
      stubCmd('sdb connect 1.2.3.6', getMock('tizen23/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.6 capability', getMock('tizen23/sdb_capability.txt'));
      const result = await reqJson('api/tv/info?ip=1.2.3.6');
      assert.deepEqual(result, {
        platform: 'tizen',
        id: '1',
        ip: '1.2.3.6',
        mac: 'AA:AA:AA:AA:AA:AA',
        name: '[TV] UE40J6390',
        modelName: 'UE40J6330',
        modelYear: '15',
        resolution: '1920x1080',
        developerMode: false,
        developerIP: '1.2.3.4',
        hasAccess: true,
        osVersion: '2.3.0',
        alias: 'test',
        lastUsed: 'unknown',
      });
    });
  });

  it('tv logs tizen', async () => {
    const result = await reqJson('api/tv/logs?ip=1.2.3.5');
    assert.deepEqual(result, {
      url: `http://localhost:${httpPort}/tizen/logs?ip=1.2.3.5`,
    });

    const logsResult = await req('tizen/logs?ip=1.2.3.5');
    assert.equal(logsResult.status, 200);
  });

  it('dev-panel tizen 24', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
    const result = await reqJson('api/tv/dev-panel?ip=1.2.3.5');
    assert.deepEqual(result, {
      url: `http://localhost:${httpPort}/proxy/http/1.2.3.5/8001/`,
    });
  });

  it('dev-panel tizen 23', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen23/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen23/sdb_capability.txt'));
    const result = await reqJson('api/tv/dev-panel?ip=1.2.3.5');
    assert.deepEqual(result, {
      url: `http://localhost:${httpPort}/tizen/dev-panel?ip=1.2.3.5`,
    });

    const response = getMock('tizen23/msf_tv_info.json');
    nock('http://1.2.3.5:8001').persist().get('/api/v2/').reply(200, response);
    const devPanelResult = await req('tizen/dev-panel?ip=1.2.3.5');
    assert.equal(devPanelResult.status, 200);
  });

  it('browser tizen 2', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
    const wsServer = stubWS('ws://1.2.3.5:8001/api/v2/channels/samsung.remote.control');
    wsServer.on('connection', (socket) => {
      socket.send(JSON.stringify(getMock('tizen24/msf_ws_channel_connected.json')));
      socket.on('message', (msg) => {
        const parsedMsg = JSON.parse(msg as string);
        assert.deepEqual(parsedMsg, {
          method: 'ms.channel.emit',
          params: {
            event: 'ed.apps.launch',
            to: 'host',
            data: {
              appId: 'org.tizen.browser',
              action_type: 'NATIVE_LAUNCH',
              metaTag: 'http://google.com',
            },
          },
        });
        socket.send(JSON.stringify(getMock('tizen24/msf_ws_eden_app_launch_ok.json')));
      });
    });
    const result = await reqJson(`api/tv/browser?ip=1.2.3.5&url=${encodeURIComponent('google.com')}`, {
      method: 'post',
    });
    assert.deepEqual(result, {
      result: 'Launched browser with URL http://google.com',
    });
  });

  it('browser tizen 3-4 with existing token', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
    const wsServer = stubWS(
      `wss://1.2.3.5:8002/api/v2/channels/samsung.remote.control?token=1234567&name=${toBase64('rtv')}`
    );
    const channelConnectedMock = JSON.stringify(getMock('tizen40/msf_ws_channel_connected.json'));
    const launchOkMock = JSON.stringify(getMock('tizen40/msf_ws_eden_app_launch_ok.json'));
    wsServer.on('connection', (socket) => {
      socket.send(channelConnectedMock);
      socket.on('message', (msg) => {
        const parsedMsg = JSON.parse(msg as string);
        assert.deepEqual(parsedMsg, {
          method: 'ms.channel.emit',
          params: {
            event: 'ed.apps.launch',
            to: 'host',
            data: {
              appId: 'org.tizen.browser',
              action_type: 'NATIVE_LAUNCH',
              metaTag: 'http://google.com',
            },
          },
        });
        socket.send(launchOkMock);
      });
    });
    sinon.stub(WssTokenManager, 'get').returns('1234567');
    sinon.stub(WssTokenManager, 'set');
    const result = await reqJson(`api/tv/browser?ip=1.2.3.5&url=${encodeURIComponent('google.com')}`, {
      method: 'post',
    });
    assert.deepEqual(result, {
      result: 'Launched browser with URL http://google.com',
    });
  });

  it('browser tizen 3-4 with no token', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
    stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
    const wsServer = stubWS(`wss://1.2.3.5:8002/api/v2/channels/samsung.remote.control?token=&name=${toBase64('rtv')}`);
    const channelConnectedMock = JSON.stringify(getMock('tizen40/msf_ws_channel_connected.json'));
    const launchOkMock = JSON.stringify(getMock('tizen40/msf_ws_eden_app_launch_ok.json'));
    wsServer.on('connection', (socket) => {
      socket.send(channelConnectedMock);
      socket.on('message', (msg) => {
        const parsedMsg = JSON.parse(msg as string);
        assert.deepEqual(parsedMsg, {
          method: 'ms.channel.emit',
          params: {
            event: 'ed.apps.launch',
            to: 'host',
            data: {
              appId: 'org.tizen.browser',
              action_type: 'NATIVE_LAUNCH',
              metaTag: 'http://google.com',
            },
          },
        });
        socket.send(launchOkMock);
      });
    });
    sinon.stub(WssTokenManager, 'get').returns('');
    sinon.stub(WssTokenManager, 'set');
    const result = await reqJson(`api/tv/browser?ip=1.2.3.5&url=${encodeURIComponent('google.com')}`, {
      method: 'post',
    });
    assert.deepEqual(result, {
      result: 'Launched browser with URL http://google.com',
    });
  });

  describe('Known tvs', () => {
    beforeEach(() => {
      initDb(
        new MemoryAdapter('', {
          defaultValue: {
            tvs: [
              {
                id: '1',
                alias: 'one',
                ip: '192.168.0.1',
                platform: 'tizen',
                mac: 'AA:AA:AA:AA:AA:AA',
              },
              {
                id: '2',
                alias: 'two',
                ip: '192.168.0.2',
                platform: 'tizen',
                mac: 'BB:BB:BB:BB:BB:BB',
              },
            ],
          },
        })
      );
    });

    after(() => {
      initDb();
    });

    it('get known tvs', async () => {
      const tvs = await reqJson('api/tv/known');
      assert.lengthOf(tvs, 2);
      assert.deepEqual(tvs[0], {
        id: '1',
        alias: 'one',
        ip: '192.168.0.1',
        platform: 'tizen',
        mac: 'AA:AA:AA:AA:AA:AA',
      });
    });

    it('add known tv', async () => {
      const tv = {
        id: 'new',
        alias: 'newTv',
        ip: '192.168.0.3',
        platform: 'tizen',
        mac: 'CC:CC:CC:CC:CC:CC',
      };
      const added = await reqPostJson('api/tv/known', tv);
      assert.deepEqual(added, tv);
      const tvs = await reqJson('api/tv/known');
      assert.deepEqual(
        tvs.find((curTv: KnownTv) => curTv.id === 'new'),
        tv
      );
    });

    it('update known tv', async () => {
      const updateData = {
        id: '1',
        alias: 'updatedTv',
        ip: '192.168.0.4',
        platform: 'tizen',
        mac: '22:22:22:22:22:22',
      };
      const updated = await reqPostJson('api/tv/known', updateData);
      assert.deepEqual(updated, updateData);
      const tvs = await reqJson('api/tv/known');
      assert.deepEqual(
        tvs.find((curTv: KnownTv) => curTv.id === '1'),
        updateData
      );
    });

    it('delete known tv', async () => {
      await req('api/tv/known/1', { method: 'delete' });
      const tvs = await reqJson('api/tv/known');
      assert.lengthOf(tvs, 1);
      assert.notExists(tvs.find((tv: KnownTv) => tv.id === '1'));
    });
  });
});
