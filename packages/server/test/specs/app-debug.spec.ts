import { assert } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import { values as config } from '../../src/config';

import { httpPort, httpsPort } from '../constants';
import { assertError, getMock, reqJson, stubCmd } from '../helpers';

describe('app-debug', () => {
  describe('Tizen 2.3', () => {
    it('debug ok (http)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen23/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen23/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen23/sdb_debug_ok.txt'));
      nock('http://1.2.3.5:7011').get('/pagelist.json').reply(200, getMock('tizen23/debugger-pagelist.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `http://localhost:${httpPort}/devtools/webkit/inspector.html?ws=localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1%3Frtv-user%3Dtest`,
        wsUrl: `ws://localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1?rtv-user=test`,
      });
    });
  });

  describe('Tizen 2.4', () => {
    it('debug ok (http)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_already_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen24/sdb_debug_ok.txt'));
      nock('http://1.2.3.5:7011').get('/pagelist.json').reply(200, getMock('tizen24/debugger-pagelist.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `http://localhost:${httpPort}/devtools/webkit/inspector.html?ws=localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1%3Frtv-user%3Dtest`,
        wsUrl: `ws://localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1?rtv-user=test`,
      });
    });

    it('debug ok (https)', async () => {
      sinon.stub(config, 'httpsPort').get(() => httpsPort);
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen24/sdb_debug_ok.txt'));
      nock('http://1.2.3.5:7011').get('/pagelist.json').reply(200, getMock('tizen24/debugger-pagelist.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `https://localhost:${httpsPort}/devtools/webkit/inspector.html?wss=localhost:${httpsPort}/proxy/http/1.2.3.5/7011/devtools/page/1%3Frtv-user%3Dtest`,
        wsUrl: `wss://localhost:${httpsPort}/proxy/http/1.2.3.5/7011/devtools/page/1?rtv-user=test`,
      });
    });

    it('close running app before re-debug', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen24/sdb_debug_ok.txt'));
      nock('http://1.2.3.5:7011').get('/pagelist.json').reply(200, getMock('tizen24/debugger-pagelist.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `http://localhost:${httpPort}/devtools/webkit/inspector.html?ws=localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1%3Frtv-user%3Dtest`,
        wsUrl: `ws://localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/1?rtv-user=test`,
      });
    });
  });

  describe('Tizen 3.0', () => {
    it('debug ok (http)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen30/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen30/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID TESTABCDEF.myapp', '');
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen30/sdb_debug_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID null', '');
      nock('http://1.2.3.5:7011').get('/json/list').reply(200, getMock('tizen30/debugger-json-list.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `http://localhost:${httpPort}/devtools/inspector.html?ws=localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74%3Frtv-user%3Dtest`,
        wsUrl: `ws://localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74?rtv-user=test`,
      });
    });

    it('debug ok (https)', async () => {
      sinon.stub(config, 'httpsPort').get(() => httpsPort);
      stubCmd('sdb connect 1.2.3.5', getMock('tizen30/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen30/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID TESTABCDEF.myapp', '');
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen30/sdb_debug_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID null', '');
      nock('http://1.2.3.5:7011').get('/json/list').reply(200, getMock('tizen30/debugger-json-list.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `https://localhost:${httpsPort}/devtools/inspector.html?wss=localhost:${httpsPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74%3Frtv-user%3Dtest`,
        wsUrl: `wss://localhost:${httpsPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74?rtv-user=test`,
      });
    });

    it('fail with port 0', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen30/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen30/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID TESTABCDEF.myapp', '');
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen30/sdb_debug_failed_no_port.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID null', '');
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assertError(result, 'Error: Debug failed - port not found in output:');
    });

    it('fail on setRWIAppID null', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen30/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen30/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID TESTABCDEF.myapp', '');
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp 5000', getMock('tizen30/sdb_debug_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 setRWIAppID null', getMock('tizen30/sdb_error_target_not_found.txt'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assertError(result, 'Error: error: target not found');
    });
  });

  describe('Tizen 4', () => {
    it('debug ok (http)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen40/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen40/sdb_capability.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 debug TESTABCDEF.myapp', getMock('tizen40/sdb_debug_ok.txt'));
      nock('http://1.2.3.5:7011').get('/json/list').reply(200, getMock('tizen30/debugger-json-list.json'));
      const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.deepEqual(result, {
        title: 'App Title',
        debugUrl: `http://localhost:${httpPort}/devtools/tizen4/inspector.html?ws=localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74%3Frtv-user%3Dtest`,
        wsUrl: `ws://localhost:${httpPort}/proxy/http/1.2.3.5/7011/devtools/page/6319D57F-1A01-403A-915A-CBF24A9C4D74?rtv-user=test`,
      });
    });
  });

  it('invalid app id', async () => {
    const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=111299001912', {
      method: 'post',
    });
    assertError(result, 'Error: You should use app id from config.xml, e.g. "TESTABCDEF.myapp"');
  });

  it('sdb timeout', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'), {
      timeout: 65 * 1000,
    });
    const result = await reqJson('api/app/debug?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
    assertError(result, 'Error: spawn /bin/sh ETIMEDOUT: sdb connect 1.2.3.5');
  });
});
