import { assert } from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import Timeout from 'await-timeout';

import * as lastUsed from '../../src/helpers/tv-last-used';

import { getMock, reqJson } from '../helpers';

describe.skip('tv.discovery', () => {
  it('should get TVs from config when no fullscan flag', async () => {
    sinon.stub(lastUsed, 'getTvLastUsed').returns(undefined);
    nock(`http://1.2.3.6:8001`).get('/api/v2/').reply(200, getMock('tizen23/msf_tv_info.json'));
    const result = await reqJson('api/tv/list?fullscan=false');
    assert.deepEqual(result, [
      {
        platform: 'tizen',
        ip: '1.2.3.6',
        name: '[TV] UE40J6390',
        modelYear: '15',
        resolution: '1920x1080',
        developerMode: false,
        developerIP: '1.1.1.1',
        hasAccess: false,
        alias: 'test',
        lastUsed: 'unknown',
        streamUrl: '',
      },
    ]);
  });

  it('should discover TVs when fullscan flag', async () => {
    sinon.stub(lastUsed, 'getTvLastUsed').returns(undefined);
    nock(`http://1.2.3.1:8001`).get('/api/v2/').reply(200, getMock('tizen24/msf_tv_info.json'));
    nock(`http://1.2.3.2:8001`).get('/api/v2/').delay(10).reply(200, getMock('tizen30/msf_tv_info.json'));
    nock(`http://1.2.3.3:8001`).get('/api/v2/').reply(500, 'Error');
    nock(`http://1.2.3.4:8001`).get('/api/v2/').replyWithError('Error');
    for (let i = 5; i <= 255; i++) {
      nock(`http://1.2.3.${i}:8001`).get('/api/v2/').delay(3001).reply(200);
    }
    const result = await reqJson('api/tv/list?fullscan=true');
    assert.deepEqual(result, [
      {
        platform: 'tizen',
        ip: '1.2.3.5',
        name: '[TV] Kitchen',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '87.250.238.225',
        hasAccess: false,
        alias: '',
        streamUrl: '',
        lastUsed: 'unknown',
      },
      {
        platform: 'tizen',
        ip: '87.250.238.242',
        name: '[TV] Galina',
        modelYear: '17',
        resolution: '3840x2160',
        developerMode: true,
        developerIP: '87.250.238.251',
        hasAccess: false,
        alias: '',
        streamUrl: '',
        lastUsed: 'unknown',
      },
    ]);
  });

  it('parallel calls should re-use the same promise if pending', async () => {
    sinon.stub(lastUsed, 'getTvLastUsed').returns(undefined);
    const scope = nock(`http://1.2.3.1:8001`).get('/api/v2/').times(2).reply(200, getMock('tizen24/msf_tv_info.json'));
    for (let i = 2; i <= 255; i++) {
      nock(`http://1.2.3.${i}:8001`).get('/api/v2/').delay(3001).reply(200);
    }
    const result = await Promise.all([
      reqJson('api/tv/list?fullscan=true'),
      Timeout.set(10).then(() => reqJson('api/tv/list?fullscan=true')),
    ]);
    assert.notOk(scope.isDone(), 'scope should not be done because only one of two requests performed');
    nock.cleanAll();
    assert.deepEqual(result[0], result[1]);
    assert.deepEqual(result[0], [
      {
        platform: 'tizen',
        ip: '1.2.3.5',
        name: '[TV] Kitchen',
        modelYear: '16',
        resolution: '1920x1080',
        developerMode: true,
        developerIP: '87.250.238.225',
        hasAccess: false,
        alias: '',
        streamUrl: '',
        lastUsed: 'unknown',
      },
    ]);
  });
});
