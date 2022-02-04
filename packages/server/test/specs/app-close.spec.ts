import { assert } from 'chai';
import nock from 'nock';

import { tvHost } from '../constants';
import { stubCmd, getMock, req } from '../helpers';

describe('app-close', () => {
  describe('installed app', () => {
    beforeEach(() => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
    });

    it('tizen23: close running app', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen23/sdb_kill_ok.txt'));
      const response = await req('api/app/close?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.equal(response.status, 200);
    });

    it('tizen24: close running app', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_terminated.txt'));
      const response = await req('api/app/close?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.equal(response.status, 200);
    });

    it('close not running app', async () => {
      stubCmd('sdb -s 1.2.3.5 shell 0 kill TESTABCDEF', getMock('tizen24/sdb_kill_already_terminated.txt'));
      const response = await req('api/app/close?ip=1.2.3.5&appId=TESTABCDEF.myapp', { method: 'post' });
      assert.equal(response.status, 200);
    });
  });

  describe('cloud app', () => {
    it('close running app', async () => {
      nock(tvHost).delete('/api/v2/webapplication/').reply(200, getMock('tizen24/msf_ok.json'));
      const response = await req('api/app/close?ip=1.2.3.5&appId=http://google.com', { method: 'post' });
      assert.equal(response.status, 200);
    });

    it('close not running app', async () => {
      nock(tvHost).delete('/api/v2/webapplication/').reply(200, getMock('tizen24/msf_ok.json'));
      const response = await req('api/app/close?ip=1.2.3.5&appId=http://google.com', { method: 'post' });
      assert.equal(response.status, 200);
    });
  });
});
