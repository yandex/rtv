import { assert } from 'chai';
import nock from 'nock';

import { tvHost } from '../constants';
import { getMock, reqJson } from '../helpers';

describe('app-state', () => {
  describe('installed app', () => {
    it('returns state', async () => {
      nock(tvHost)
        .get('/api/v2/applications/TESTABCDEF.myapp')
        .reply(200, getMock('tizen24/msf_app_state.json', { running: false, visible: false }));
      const result = await reqJson('api/app/state?ip=1.2.3.5&appId=TESTABCDEF.myapp');
      assert.deepEqual(result, {
        name: 'My App',
        installed: true,
        running: false,
        version: '1.0.1',
        visible: false,
      });
    });

    it('tizen23: returns correct state', async () => {
      nock(tvHost)
        .get('/api/v2/applications/TESTABCDEF.myapp')
        .reply(200, getMock('tizen23/msf_app_state.json', { running: false, visible: true }));
      const result = await reqJson('api/app/state?ip=1.2.3.5&appId=TESTABCDEF.myapp');
      assert.deepEqual(result, {
        installed: true,
        name: 'My App',
        running: true,
        version: '1.0.1',
        visible: true,
      });
    });

    it('app not found', async () => {
      nock(tvHost).get('/api/v2/applications/TESTABCDEF.myapp').reply(404, getMock('tizen24/msf_not_found.json'));
      const result = await reqJson('api/app/state?ip=1.2.3.5&appId=TESTABCDEF.myapp');
      assert.deepEqual(result, {
        installed: false,
        running: false,
      });
    });
  });

  describe('cloud app', () => {
    it('returns state', async () => {
      nock(tvHost).get('/api/v2/webapplication/').reply(200, getMock('tizen24/msf_cloud_app_state.json'));
      const result = await reqJson('api/app/state?ip=1.2.3.5&appId=http://google.com');
      assert.deepEqual(result, {
        installed: true,
        name: 'App Launcher',
        running: true,
        version: '3.2.10',
        visible: true,
      });
    });
  });
});
