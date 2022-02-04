import { assert } from 'chai';

import { assertError, getMock, reqJson, req, stubCmd } from '../helpers';

describe('app-uninstall', () => {
  it('ok (Tizen 2.4)', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
    stubCmd(`sdb -s 1.2.3.5 shell 0 vd_appuninstall TESTABCDEF.App`, getMock('tizen24/sdb_uninstall_ok.txt'));
    const response = await req('api/app/uninstall?ip=1.2.3.5&appId=TESTABCDEF.App', { method: 'post' });
    assert.equal(response.status, 200);
  });

  it('failed (Tizen 2.4)', async () => {
    stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
    stubCmd(`sdb -s 1.2.3.5 shell 0 vd_appuninstall TESTABCDEF.App`, getMock('tizen24/sdb_uninstall_failed.txt'));
    const result = await reqJson('api/app/uninstall?ip=1.2.3.5&appId=TESTABCDEF.App', { method: 'post' });
    assertError(
      result,
      'Error: uninstall TESTABCDEF.App\napp_id[TESTABCDEF.App] uninstall start\napp_id[TESTABCDEF.App] uninstall failed[132]\nspend time for wascmd is [72]ms\ncmd_ret:0'
    );
  });
});
