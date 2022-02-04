import fs from 'fs';
import os from 'os';
import FormData from 'form-data';

import { assert } from 'chai';

import { assertError, getMock, reqJson, stubCmd } from '../helpers';

describe('app-install', () => {
  describe('tizen', () => {
    it('from .wgt (Tizen 2.4)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      // tizen install outputs to stderr, not stdout
      stubCmd(
        `tizen install -s 1.2.3.5:26101 -n mock_uid.wgt -- ${os.tmpdir()}/rtv-temp/uploads`,
        getMock('tizen24/sdb_install_ok.txt'),
        { error: true }
      );
      const formData = new FormData();
      formData.append('ip', '1.2.3.5');
      formData.append('file', fs.createReadStream('test/mocks/App.wgt'), { filename: 'App.wgt' });
      const result = await reqJson('api/app/install', { method: 'POST', body: formData });
      assert.deepEqual(result, {
        result: 'ok',
        appId: 'TESTABCDEF.App',
      });
    });

    it('from .zip (Tizen 2.4)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      // tizen install outputs to stderr, not stdout
      stubCmd(
        `tizen install -s 1.2.3.5:26101 -n TESTABCDEF.App_mock_uid.wgt -- ${os.tmpdir()}/rtv-temp/builds`,
        getMock('tizen24/sdb_install_ok.txt'),
        { error: true }
      );
      stubCmd('tizen security-profiles list', getMock('tizen24/security_profiles_list.txt'));
      stubCmd(
        `tizen package -t wgt -s Profile -- ${os.tmpdir()}/rtv-temp/mock_uid -o ${os.tmpdir()}/rtv-temp/builds`,
        getMock('tizen24/package_-t_wgt.txt')
      );
      stubCmd(
        `mv '${os.tmpdir()}/rtv-temp/builds/App (test).wgt' '${os.tmpdir()}/rtv-temp/builds/TESTABCDEF.App_mock_uid.wgt'`,
        ''
      );
      stubCmd(
        `rm -f ${os.tmpdir()}/rtv-temp/mock_uid/.manifest.tmp ${os.tmpdir()}/rtv-temp/mock_uid/author-signature.xml ${os.tmpdir()}/rtv-temp/mock_uid/signature1.xml`,
        ''
      );
      stubCmd(`rm -f ${os.tmpdir()}/rtv-temp/builds/*.wgt`, '');
      const formData = new FormData();
      formData.append('ip', '1.2.3.5');
      formData.append('file', fs.createReadStream('test/mocks/App.zip'), { filename: 'App.zip' });
      const result = await reqJson('api/app/install', { method: 'POST', body: formData });
      assert.deepEqual(result, {
        result: 'ok',
        appId: 'TESTABCDEF.App',
      });
    });

    it('broken package (Tizen 2.4)', async () => {
      stubCmd('sdb connect 1.2.3.5', getMock('tizen24/sdb_connect_ok.txt'));
      stubCmd('sdb -s 1.2.3.5 capability', getMock('tizen24/sdb_capability.txt'));
      stubCmd(
        `tizen install -s 1.2.3.5:26101 -n mock_uid.wgt -- ${os.tmpdir()}/rtv-temp/uploads`,
        getMock('tizen24/sdb_install_broken_package.txt'),
        { error: true }
      );
      const formData = new FormData();
      formData.append('ip', '1.2.3.5');
      formData.append('file', fs.createReadStream('test/mocks/App.wgt'), { filename: 'App.wgt' });
      const result = await reqJson('api/app/install', { method: 'POST', body: formData });
      assertError(result, 'Error: Transferring the package...');
    });
  });
});
