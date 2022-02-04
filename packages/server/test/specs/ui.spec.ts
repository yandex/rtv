import { assert } from 'chai';

import { req } from '../helpers';

describe('ui', () => {
  it('index html', async () => {
    const response = await req('/', {});
    const text = await response.text();
    assert.include(text, '<title>RTV UI</title>');
  });
});
