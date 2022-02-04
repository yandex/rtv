import path from 'path';
import os from 'os';
import nock from 'nock';
import cliPkg from '../src/pkg';

export const serverHost = 'http://rtv-mock-server';
export const testTmpDir = path.join(os.tmpdir(), 'rtv-test');
export const serverMock = nock(serverHost).defaultReplyHeaders({
  'x-rtv-server-version': cliPkg?.version || '',
});
