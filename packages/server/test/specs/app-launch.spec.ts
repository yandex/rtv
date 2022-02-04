import { assert } from 'chai';
import nock from 'nock';

import { tvHost } from '../constants';
import { getMock, req, stubCmd } from '../helpers';

describe('app-launch', () => {
  describe('installed app', () => {
    it('without params', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_already_terminated.txt'));
      nock(tvHost).post('/api/v2/applications/TESTABCDEF.myapp').reply(200, getMock('tizen24/msf_ok.json'));
      const response = await req('api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.equal(response.status, 200);
    });

    it('with params', async () => {
      const params = JSON.stringify({ foo: 'bar', x: 1 });
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_already_terminated.txt'));
      nock(tvHost)
        .post('/api/v2/applications/TESTABCDEF.myapp', { id: params })
        .reply(200, getMock('tizen24/msf_ok.json'));
      const response = await req(
        `api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.myapp&params=${encodeURIComponent(params)}`,
        { method: 'post' }
      );
      assert.equal(response.status, 200);
    });
  });

  describe('cloud app', () => {
    it('without params', async () => {
      nock(tvHost).delete('/api/v2/webapplication/').reply(200, getMock('tizen24/msf_ok.json'));
      nock(tvHost)
        .post('/api/v2/webapplication/', { url: 'http://google.com' })
        .reply(200, getMock('tizen24/msf_ok.json'));
      const response = await req('api/app/launch?ip=1.2.3.5&appId=http://google.com', { method: 'post' });
      assert.equal(response.status, 200);
    });

    it('with params', async () => {
      nock(tvHost).delete('/api/v2/webapplication/').reply(200, getMock('tizen24/msf_ok.json'));
      nock(tvHost)
        .post('/api/v2/webapplication/', { url: 'http://google.com?foo=bar&x=1' })
        .reply(200, getMock('tizen24/msf_ok.json'));
      const params = JSON.stringify({ foo: 'bar', x: 1 });
      const response = await req(
        `api/app/launch?ip=1.2.3.5&appId=http://google.com&params=${encodeURIComponent(params)}`,
        { method: 'post' }
      );
      assert.equal(response.status, 200);
    });
  });
});
