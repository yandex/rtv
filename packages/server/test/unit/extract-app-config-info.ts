import path from 'path';
import { readFile } from 'fs-extra';
import { assert } from 'chai';
import { extractAppConfigInfo } from '../../src/platform/tizen/utils';

describe('extract info from tizen config', async () => {
  it('should parse main fields', async () => {
    const config = await readFile(path.join(__dirname, '../mocks/config.xml'), 'utf8');
    const result = await extractAppConfigInfo(config);

    assert.deepEqual(result, {
      appId: 'ABCDEF.12345',
      appName: 'NAME',
      packageId: 'ABCDEF',
    });
  });
});
