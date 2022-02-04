import { assert } from 'chai';
import nock from 'nock';

import { getMock, req, reqJson, stubCmd } from '../helpers';

const stubLaunchCommand = (ip: string) => {
  stubCmd(`sdb connect ${ip}`, getMock('tizen24/sdb_connect_ok.txt'));
  stubCmd(`sdb -s ${ip} shell 0 kill TESTABCDEF`, getMock('tizen24/sdb_kill_already_terminated.txt'));
  nock(`http://${ip}:8001`).post('/api/v2/applications/TESTABCDEF.myapp').reply(200, getMock('tizen24/msf_ok.json'));
};

describe('common functionality', () => {
  it('should update last used', async () => {
    await reqJson('api/tv/free?ip=1.2.3.6', { method: 'post' });
    const beforeUse = await reqJson('api/tv/known?additionalInfo=true');
    assert.deepEqual(beforeUse[1].lastUsed, 'unknown');

    stubLaunchCommand('1.2.3.6');
    await req('api/app/launch?ip=1.2.3.6&appId=TESTABCDEF.myapp', { method: 'post' });

    const afterUse = await reqJson('api/tv/known?additionalInfo=true');
    assert.deepEqual(afterUse[1].lastUsed, 'test (app/launch now)');
  });

  it('check tv is occupied by another user', async () => {
    stubLaunchCommand('1.2.3.5');
    await req('api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.myapp', {
      method: 'post',
      headers: {
        'x-rtv-user': 'user1',
      },
    });

    const anotherUserResponse = await reqJson('api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.myapp', {
      method: 'post',
      headers: {
        'x-rtv-check-last-used': 'true',
        'x-rtv-user': 'user2',
      },
    });

    assert.equal(anotherUserResponse.message, 'Error: 1.2.3.5 is occupied by user1');
    assert.equal(anotherUserResponse.type, 'tv-is-occupied');

    stubLaunchCommand('1.2.3.5');
    const forcedResponse = await req('api/app/launch?ip=1.2.3.5&appId=TESTABCDEF.myapp', {
      method: 'post',
      headers: {
        'x-rtv-user': 'user2',
      },
    });

    assert.equal(forcedResponse.status, 200);
  });
});
