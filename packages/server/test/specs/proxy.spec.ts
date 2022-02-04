import { assert } from 'chai';
import nock from 'nock';

import { httpPort } from '../constants';
import { reqJson } from '../helpers';

describe('proxy', () => {
  beforeEach(() => {
    nock(`http://1.2.3.1:8001`).get('/api/v2/').optionally().reply(200, { foo: 'bar' });
  });

  it('proxy direct request', async () => {
    const result = await reqJson('proxy/http/1.2.3.1/8001/api/v2/');
    assert.equal(result.foo, 'bar');
  });

  it('proxy root request from proxied page (by referer header)', async () => {
    const referer = `http://localhost:${httpPort}/proxy/http/1.2.3.1/8001/api/v2/index.html`;
    const headers = { referer };
    const result = await reqJson('api/v2/', { headers });
    assert.equal(result.foo, 'bar');
  });

  it('proxy root request from proxied page (by referer in cookie)', async () => {
    const referer = `http://localhost:${httpPort}/proxy/http/1.2.3.1/8001/api/v2/index.html`;
    const cookie = `_rtv_referer=${encodeURIComponent(referer)}`;
    const headers = { cookie };
    const result = await reqJson('api/v2/', { headers });
    assert.equal(result.foo, 'bar');
  });

  it('do not proxy root request by default', async () => {
    nock(`http://localhost:${httpPort}`).get('/abc').reply(200, { foo: 'xxx' });
    const result = await reqJson('abc');
    assert.equal(result.foo, 'xxx');
  });
});
