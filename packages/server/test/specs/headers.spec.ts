import { assert } from 'chai';
import sinon from 'sinon';

import * as serverPkg from '../../src/pkg';

import { req } from '../helpers';

describe('headers', () => {
  it('cors', async () => {
    const response = await req('api/system/status', {
      headers: {
        Origin: 'http://example.host.ru:3001',
      },
    });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://example.host.ru:3001');
  });

  it('x-rtv-server-version', async () => {
    sinon.stub(serverPkg, 'version').get(() => '1.2.3');
    const response = await req('api/system/status');
    assert.equal(response.headers.get('x-rtv-server-version'), '1.2.3');
  });
});
