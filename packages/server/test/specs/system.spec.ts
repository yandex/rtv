import os from 'os';

import { assert } from 'chai';
import sinon from 'sinon';

import * as proxyConnections from '../../src/proxy/connections';

import { req, reqJson, stubCmd } from '../helpers';

describe('system', () => {
  it('status', async () => {
    sinon.stub(proxyConnections, 'getAllConnections').returns([{ target: 'url', created: 12345 }]);
    const result = await reqJson('api/system/status');
    assert.deepEqual(result, {
      websockets: JSON.stringify([{ target: 'url', created: 12345 }]),
    });
  });

  it('404', async () => {
    const response = await req('api/foo');
    const result = await response.json();
    assert.equal(response.status, 404);
    assert.deepEqual(result, {
      message: 'Route not found: GET /api/foo',
    });
  });

  it('env', async () => {
    sinon.stub(process, 'version').get(() => 'v8.15.1');
    sinon.stub(os, 'platform').callsFake(() => 'linux');
    stubCmd(
      'nmcli --fields name,type,active,device connection show',
      ['NAME         TYPE             ACTIVE  DEVICE', 'MobTest      802-11-wireless  yes     wlp1s0'].join('\n')
    );
    stubCmd('sdb version', 'Smart Development Bridge version 4.1.3');
    stubCmd('tizen version', 'Tizen CLI 2.4.48');
    stubCmd('ares-setup-device --version', 'foo');
    const response = await req('api/system/env', {});
    const result = await response.json();
    assert.deepEqual(result, {
      ip: '1.2.3.4',
      sdb: 'Smart Development Bridge version 4.1.3',
      tizen: 'Tizen CLI 2.4.48',
      ares: 'foo',
      node: 'v8.15.1',
      platform: 'linux',
      network: 'NAME         TYPE             ACTIVE  DEVICE\nMobTest      802-11-wireless  yes     wlp1s0',
    });
  });
});
